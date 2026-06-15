<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(
        private OrderService $orders,
        private OrderStateMachine $stateMachine,
        private StockReservationService $stock,
        private AuditLogService $audit,
    ) {}

    public function createCheckoutSession(Order $order, ?string $idempotencyKey = null): array
    {
        if ($order->payment_method !== 'online') {
            throw new \InvalidArgumentException('Checkout session is only for online payments.');
        }

        if ($order->payment_status === 'paid') {
            throw new \InvalidArgumentException('Order is already paid.');
        }

        $idempotencyKey ??= Str::uuid()->toString();

        $existing = PaymentTransaction::where('idempotency_key', $idempotencyKey)->first();
        if ($existing) {
            return $this->formatTransactionResponse($existing);
        }

        $transaction = PaymentTransaction::create([
            'order_id' => $order->id,
            'gateway' => 'stripe',
            'idempotency_key' => $idempotencyKey,
            'status' => PaymentTransaction::STATUS_PENDING,
            'amount' => $order->total,
            'currency' => 'CAD',
        ]);

        $secret = config('services.stripe.secret');
        if (! $secret) {
            $transaction->update(['status' => PaymentTransaction::STATUS_PROCESSING]);

            return [
                'transaction_id' => $transaction->id,
                'status' => 'processing',
                'message' => 'Online payment is not configured. Contact support to complete payment.',
                'checkout_url' => null,
            ];
        }

        $session = $this->createStripeSession($order, $transaction, $secret);
        $transaction->update([
            'status' => PaymentTransaction::STATUS_PROCESSING,
            'gateway_reference' => $session['id'] ?? null,
            'metadata' => $session,
        ]);

        return [
            'transaction_id' => $transaction->id,
            'status' => 'processing',
            'checkout_url' => $session['url'] ?? null,
            'session_id' => $session['id'] ?? null,
        ];
    }

    public function confirmPaidFromGateway(Order $order, PaymentTransaction $transaction, array $metadata = []): Order
    {
        if ($order->payment_status === 'paid') {
            return $order;
        }

        $transaction->update([
            'status' => PaymentTransaction::STATUS_PAID,
            'paid_at' => now(),
            'metadata' => array_merge($transaction->metadata ?? [], $metadata),
        ]);

        $order->update([
            'payment_status' => 'paid',
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $this->stock->commitReservation($order);
        $this->stateMachine->assertCanTransition($order->fresh(), 'preparing');
        $this->orders->transition($order->fresh(), 'preparing');
        $this->orders->transition($order->fresh(), 'ready_for_pickup');

        $this->audit->log('payment_confirmed', null, Order::class, $order->id, [
            'gateway' => $transaction->gateway,
            'reference' => $transaction->gateway_reference,
            'amount' => $transaction->amount,
        ]);

        return $order->fresh();
    }

    public function confirmManualPayment(Order $order, $admin, string $note = ''): Order
    {
        if ($order->payment_status === 'paid') {
            return $order;
        }

        if (! in_array($order->payment_method, ['bank_transfer', 'invoice'], true)) {
            throw new \InvalidArgumentException('Manual confirmation is only for bank transfer or invoice orders.');
        }

        PaymentTransaction::create([
            'order_id' => $order->id,
            'gateway' => 'manual',
            'idempotency_key' => Str::uuid()->toString(),
            'status' => PaymentTransaction::STATUS_PAID,
            'amount' => $order->total,
            'currency' => 'CAD',
            'paid_at' => now(),
            'metadata' => ['note' => $note, 'confirmed_by' => $admin->id],
        ]);

        $order->update([
            'payment_status' => 'paid',
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $this->stock->commitReservation($order);
        $this->stateMachine->assertCanTransition($order->fresh(), 'preparing');
        $this->orders->transition($order->fresh(), 'preparing');
        $this->orders->transition($order->fresh(), 'ready_for_pickup');

        $this->audit->log('payment_manual_confirmed', $admin, Order::class, $order->id, [
            'payment_method' => $order->payment_method,
            'note' => $note,
        ]);

        return $order->fresh();
    }

    public function handleStripeWebhook(string $payload, ?string $signature): void
    {
        $secret = config('services.stripe.webhook_secret');
        if ($secret && $signature) {
            $this->verifyStripeSignature($payload, $signature, $secret);
        }

        $event = json_decode($payload, true);
        if (! is_array($event)) {
            throw new \InvalidArgumentException('Invalid webhook payload.');
        }

        if (($event['type'] ?? '') === 'checkout.session.completed') {
            $session = $event['data']['object'] ?? [];
            $sessionId = $session['id'] ?? null;
            if (! $sessionId) {
                return;
            }

            $transaction = PaymentTransaction::where('gateway_reference', $sessionId)->first();
            if (! $transaction || $transaction->status === PaymentTransaction::STATUS_PAID) {
                return;
            }

            $order = $transaction->order;
            $this->confirmPaidFromGateway($order, $transaction, ['webhook_event' => $event['type']]);
        }
    }

    private function createStripeSession(Order $order, PaymentTransaction $transaction, string $secret): array
    {
        $successUrl = config('services.stripe.success_url', config('app.url').'/checkout/success?order='.$order->order_number);
        $cancelUrl = config('services.stripe.cancel_url', config('app.url').'/checkout/cancel?order='.$order->order_number);

        $response = Http::withToken($secret)
            ->asForm()
            ->post('https://api.stripe.com/v1/checkout/sessions', [
                'mode' => 'payment',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'client_reference_id' => (string) $order->id,
                'metadata[order_id]' => (string) $order->id,
                'metadata[transaction_id]' => (string) $transaction->id,
                'line_items[0][price_data][currency]' => 'cad',
                'line_items[0][price_data][product_data][name]' => 'Order '.$order->order_number,
                'line_items[0][price_data][unit_amount]' => (int) round($order->total * 100),
                'line_items[0][quantity]' => 1,
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Failed to create Stripe checkout session.');
        }

        return $response->json();
    }

    private function verifyStripeSignature(string $payload, string $signature, string $secret): void
    {
        $parts = [];
        foreach (explode(',', $signature) as $element) {
            [$key, $value] = explode('=', $element, 2);
            $parts[$key] = $value;
        }

        $timestamp = $parts['t'] ?? '';
        $sig = $parts['v1'] ?? '';
        $signed = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);

        if (! hash_equals($signed, $sig)) {
            throw new \InvalidArgumentException('Invalid Stripe webhook signature.');
        }
    }

    private function formatTransactionResponse(PaymentTransaction $transaction): array
    {
        return [
            'transaction_id' => $transaction->id,
            'status' => $transaction->status,
            'checkout_url' => $transaction->metadata['url'] ?? null,
            'session_id' => $transaction->gateway_reference,
        ];
    }
}
