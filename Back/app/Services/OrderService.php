<?php

namespace App\Services;

use App\Mail\DeliveryOtpMail;
use App\Mail\OrderConfirmationMail;
use App\Models\Client;
use App\Models\DeliveryEvent;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Shipper;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class OrderService
{
    public const QR_MAX_AGE_SECONDS = 86400;

    public function __construct(
        private OrderStateMachine $stateMachine,
        private DeliveryOtpService $deliveryOtp,
    ) {}

    public function generateOrderNumber(): string
    {
        return 'PRM-'.date('Y').'-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT);
    }

    public function generateTrackingToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    public function generateDeliveryToken(): string
    {
        return Str::random(48);
    }

    public function sendDeliveryOtpEmail(Order $order): bool
    {
        $order->loadMissing('client');
        $email = $order->client?->email;

        if (! $email) {
            return false;
        }

        $plainOtp = $this->deliveryOtp->setOtp($order);

        try {
            Mail::to($email)->send(new DeliveryOtpMail($order, $plainOtp));
            $order->delivery_otp_sent_at = now();
            $order->save();
        } catch (\Throwable $e) {
            report($e);

            return false;
        }

        $this->notifyAccount(
            $order->client,
            'delivery_otp',
            'Delivery code sent',
            "Your delivery verification code for order {$order->order_number} was emailed to {$email}.",
            ['order_id' => $order->id, 'order_number' => $order->order_number]
        );

        return true;
    }

    public function sendOrderConfirmationEmail(Order $order): bool
    {
        $order->loadMissing(['items', 'client']);
        $email = $order->client?->email;

        if (! $email) {
            return false;
        }

        try {
            Mail::to($email)->send(new OrderConfirmationMail($order));
        } catch (\Throwable $e) {
            report($e);

            return false;
        }

        return true;
    }

    public function refreshDeliveryOtp(Order $order): Order
    {
        $this->deliveryOtp->setOtp($order);
        $order->delivery_otp_sent_at = null;
        $order->save();

        return $order->fresh();
    }

    public function ensureDeliveryOtpEmail(Order $order): bool
    {
        if (! in_array($order->status, ['picked_up', 'out_for_delivery'], true)) {
            return false;
        }

        if ($order->delivery_otp_sent_at) {
            return true;
        }

        if (! $order->delivery_otp_hash) {
            $this->refreshDeliveryOtp($order);
            $order = $order->fresh();
        }

        return $this->sendDeliveryOtpEmail($order);
    }

    public function buildQrPayload(Order $order): string
    {
        $payload = [
            'oid' => $order->id,
            'tok' => $order->delivery_token,
            'ts' => now()->timestamp,
        ];

        return Crypt::encryptString(json_encode($payload));
    }

    public function parseQrPayload(string $encrypted): ?array
    {
        try {
            $decoded = json_decode(Crypt::decryptString($encrypted), true);
            if (! is_array($decoded) || empty($decoded['oid']) || empty($decoded['tok'])) {
                return null;
            }

            return $decoded;
        } catch (\Throwable) {
            return null;
        }
    }

    public function resolveOrderFromQr(string $qrPayload): Order
    {
        $parsed = $this->parseQrPayload($qrPayload);
        if (! $parsed) {
            throw new \InvalidArgumentException('Invalid QR code.');
        }

        if (! empty($parsed['ts']) && (now()->timestamp - (int) $parsed['ts']) > self::QR_MAX_AGE_SECONDS) {
            throw new \InvalidArgumentException('QR code has expired.');
        }

        $order = Order::findOrFail($parsed['oid']);

        if ($order->delivery_token !== $parsed['tok']) {
            throw new \InvalidArgumentException('QR token mismatch.');
        }

        if ($order->qr_used_at) {
            throw new \InvalidArgumentException('QR code has already been used.');
        }

        return $order;
    }

    public function logEvent(
        Order $order,
        string $eventType,
        ?string $statusBefore = null,
        ?string $statusAfter = null,
        ?Shipper $shipper = null,
        ?float $lat = null,
        ?float $lng = null,
        ?string $photo = null,
        array $metadata = []
    ): DeliveryEvent {
        return DeliveryEvent::create([
            'order_id' => $order->id,
            'shipper_id' => $shipper?->id,
            'event_type' => $eventType,
            'status_before' => $statusBefore,
            'status_after' => $statusAfter,
            'latitude' => $lat,
            'longitude' => $lng,
            'photo' => $photo,
            'metadata' => $metadata ?: null,
        ]);
    }

    public function notifyAccount(Client|Shipper|User $account, string $type, string $title, string $body, array $data = []): void
    {
        Notification::create([
            'notifiable_type' => $account->getMorphClass(),
            'notifiable_id' => $account->id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data ?: null,
        ]);
    }

    /** @deprecated use notifyAccount() */
    public function notifyUser(User $user, string $type, string $title, string $body, array $data = []): void
    {
        $this->notifyAccount($user, $type, $title, $body, $data);
    }

    public function transition(Order $order, string $newStatus, Client|Shipper|User|null $actor = null, array $extras = []): Order
    {
        $this->stateMachine->assertCanTransition($order, $newStatus);

        $before = $order->status;
        $order->status = $newStatus;

        if ($newStatus === 'ready_for_pickup') {
            $order->ready_at = now();
            $order->qr_payload = $this->buildQrPayload($order);
        }
        if ($newStatus === 'picked_up') {
            $order->picked_up_at = now();
            $order->qr_used_at = now();
            $order->delivery_token = $this->generateDeliveryToken();
            if (isset($extras['latitude'])) {
                $order->pickup_latitude = $extras['latitude'];
            }
            if (isset($extras['longitude'])) {
                $order->pickup_longitude = $extras['longitude'];
            }
            if (isset($extras['pickup_photo'])) {
                $order->pickup_photo = $extras['pickup_photo'];
            }
        }
        if ($newStatus === 'delivered') {
            $order->delivered_at = now();
            if (isset($extras['latitude'])) {
                $order->delivery_latitude = $extras['latitude'];
            }
            if (isset($extras['longitude'])) {
                $order->delivery_longitude = $extras['longitude'];
            }
            if (isset($extras['delivery_photo'])) {
                $order->delivery_photo = $extras['delivery_photo'];
            }
            if (isset($extras['delivery_signature'])) {
                $order->delivery_signature = $extras['delivery_signature'];
            }
        }
        if ($newStatus === 'failed_delivery' && isset($extras['failure_reason'])) {
            $order->failure_reason = $extras['failure_reason'];
        }

        $order->save();

        $this->logEvent($order, 'status_change', $before, $newStatus, $actor instanceof Shipper ? $actor : null,
            $extras['latitude'] ?? null,
            $extras['longitude'] ?? null,
            $extras['photo'] ?? null,
            $extras
        );

        $order->load('client');
        if ($order->client) {
            $this->notifyAccount(
                $order->client,
                'order_status',
                'Order '.$order->order_number,
                'Status updated to '.str_replace('_', ' ', $newStatus),
                ['order_id' => $order->id, 'status' => $newStatus]
            );
        }

        return $order->fresh();
    }
}
