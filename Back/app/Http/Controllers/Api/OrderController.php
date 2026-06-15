<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\OrderIndexRequest;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\TrackOrderRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\PublicOrderTrackResource;
use App\Models\Address;
use App\Models\Client;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Services\StockReservationService;
use App\Support\ProductQuantityRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orders,
        private PaymentService $payments,
        private StockReservationService $stock,
        private AuditLogService $audit,
    ) {}

    public function index(OrderIndexRequest $request): JsonResponse
    {
        $orders = Order::query()
            ->with('items')
            ->where('client_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(min((int) $request->get('per_page', 15), 50));

        return response()->json([
            'data' => OrderResource::collection($orders->getCollection()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        /** @var Client $user */
        $user = $request->user();

        if (! $user->profile_complete) {
            abort(422, 'Please complete your profile before placing an order.');
        }

        if ($user->role === 'retailer' && $user->retailer_status !== 'approved') {
            abort(422, 'Your retailer account is pending approval. You cannot place wholesale orders yet.');
        }

        $isWholesale = $user->isRetailer();

        $order = DB::transaction(function () use ($data, $user, $isWholesale) {
            $subtotal = 0;
            $lineItems = [];
            $productIds = collect($data['items'])->pluck('product_id')->unique()->all();
            $products = Product::whereIn('id', $productIds)->lockForUpdate()->get()->keyBy('id');

            foreach ($data['items'] as $row) {
                $product = $products->get($row['product_id']);
                if (! $product) {
                    abort(422, 'Product not found.');
                }
                if (! $product->is_active) {
                    abort(422, "Product {$product->name} is unavailable.");
                }
                $minQty = ProductQuantityRules::minForUser($product, $user);
                if ($row['quantity'] < $minQty) {
                    abort(422, "Minimum quantity for {$product->name} is {$minQty}.");
                }
                $maxQty = ProductQuantityRules::maxForProduct($product);
                if ($maxQty < $minQty) {
                    abort(422, "{$product->name} is out of stock.");
                }
                if ($row['quantity'] > $maxQty) {
                    abort(422, "Maximum available quantity for {$product->name} is {$maxQty}.");
                }

                $unit = $product->priceForUser($user);
                $lineTotal = round($unit * $row['quantity'], 2);
                $subtotal += $lineTotal;
                $lineItems[] = [
                    'product' => $product,
                    'quantity' => $row['quantity'],
                    'unit_price' => $unit,
                    'line_total' => $lineTotal,
                ];
            }

            $discount = 0;
            $coupon = null;
            if (! empty($data['coupon_code'])) {
                $coupon = Coupon::where('code', $data['coupon_code'])->where('is_active', true)->first();
                if ($coupon && (! $coupon->expires_at || $coupon->expires_at->isFuture())) {
                    if ($coupon->max_uses && $coupon->used_count >= $coupon->max_uses) {
                        abort(422, 'This coupon has reached its usage limit.');
                    }
                    if ($coupon->min_order && $subtotal < (float) $coupon->min_order) {
                        abort(422, 'Order does not meet the minimum for this coupon.');
                    }
                    $discount = $coupon->type === 'percent'
                        ? round($subtotal * $coupon->value / 100, 2)
                        : min((float) $coupon->value, $subtotal);
                }
            }

            $shipping = $subtotal >= 150 ? 0 : 15;
            $tax = round(($subtotal - $discount) * 0.13, 2);
            $total = round($subtotal - $discount + $tax + $shipping, 2);

            $paymentMethod = $data['payment_method'];
            $isCod = $paymentMethod === 'cod';
            $status = $isCod ? 'paid' : 'pending_payment';
            $paymentStatus = $isCod ? 'pending' : 'pending';

            $shippingAddress = $this->resolveShippingAddress($data, $user);

            $order = Order::create([
                'order_number' => $this->orders->generateOrderNumber(),
                'tracking_token' => $this->orders->generateTrackingToken(),
                'client_id' => $user->id,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'payment_method' => $paymentMethod,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping' => $shipping,
                'discount' => $discount,
                'total' => $total,
                'coupon_code' => $data['coupon_code'] ?? null,
                'shipping_address' => $shippingAddress,
                'delivery_token' => $this->orders->generateDeliveryToken(),
                'is_wholesale' => $isWholesale,
                'notes' => $data['notes'] ?? null,
                'paid_at' => null,
                'payment_expires_at' => $isCod ? null : now()->addHours(24),
            ]);

            foreach ($lineItems as $li) {
                $order->items()->create([
                    'product_id' => $li['product']->id,
                    'product_name' => $li['product']->name,
                    'sku' => $li['product']->sku,
                    'quantity' => $li['quantity'],
                    'unit_price' => $li['unit_price'],
                    'line_total' => $li['line_total'],
                ]);
            }

            $this->stock->reserveForOrder($order, $lineItems);

            if ($coupon && $discount > 0) {
                $coupon->increment('used_count');
            }

            if ($isCod) {
                $this->stock->commitReservation($order);
                $this->orders->transition($order, 'preparing');
                $this->orders->transition($order->fresh(), 'ready_for_pickup');
            }

            $this->orders->notifyAccount($user, 'order_confirmed', 'Order confirmed', "Order {$order->order_number} has been placed.");

            User::where('is_admin', true)->each(function (User $admin) use ($order) {
                $this->orders->notifyAccount(
                    $admin,
                    'new_order',
                    'New order received',
                    "Order {$order->order_number} — \${$order->total} ({$order->payment_method})."
                );
            });

            $this->audit->log('order_created', $user, Order::class, $order->id, [
                'order_number' => $order->order_number,
                'payment_method' => $paymentMethod,
                'total' => $total,
            ]);

            return $order->load('items');
        });

        $this->orders->sendOrderConfirmationEmail($order->fresh(['items', 'client']));

        return response()->json([
            'data' => new OrderResource($order),
            'tracking_token' => $order->tracking_token,
            'message' => $order->payment_method === 'cod'
                ? 'Order placed successfully.'
                : 'Order placed — awaiting payment confirmation.',
        ], 201);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->client_id !== $request->user()->id && ! ($request->user() instanceof User && $request->user()->is_admin)) {
            abort(403);
        }
        $order->load(['items', 'deliveryEvents']);

        return response()->json(['data' => (new OrderResource($order))->detailed()]);
    }

    public function track(TrackOrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        $order = Order::with(['deliveryEvents', 'client'])
            ->where('order_number', $data['order_number'])
            ->firstOrFail();

        $user = $request->user('sanctum');

        if ($user instanceof Client && $order->client_id === $user->id) {
            return response()->json(['data' => new PublicOrderTrackResource($order)]);
        }

        if (! $this->verifyTrackingAccess($order, $data, $user)) {
            throw ValidationException::withMessages(['order_number' => ['Unable to track this order.']]);
        }

        return response()->json(['data' => new PublicOrderTrackResource($order)]);
    }

    public function checkoutSession(Request $request, Order $order): JsonResponse
    {
        if ($order->client_id !== $request->user()->id) {
            abort(403);
        }

        if ($order->payment_method !== 'online') {
            abort(422, 'This order does not use online payment.');
        }

        $result = $this->payments->createCheckoutSession(
            $order,
            $request->header('Idempotency-Key')
        );

        return response()->json(['data' => $result]);
    }

    /** @deprecated Removed — payments confirmed via webhook or admin only */
    public function pay(Request $request, Order $order): JsonResponse
    {
        abort(410, 'Direct payment confirmation is disabled. Use checkout-session and wait for payment confirmation.');
    }

    /** @param  array<string, mixed>  $data */
    private function verifyTrackingAccess(Order $order, array $data, $user): bool
    {
        $token = (string) ($data['tracking_token'] ?? '');
        $phoneLast4 = (string) ($data['phone_last4'] ?? '');

        if ($token === '' || $phoneLast4 === '') {
            return false;
        }

        if (! hash_equals((string) $order->tracking_token, $token)) {
            return false;
        }

        $phone = $order->client?->phone ?? ($order->shipping_address['phone'] ?? null);
        if (! $phone) {
            return false;
        }

        return str_ends_with(preg_replace('/\D/', '', (string) $phone), $phoneLast4);
    }

    /** @param  array<string, mixed>  $data */
    private function resolveShippingAddress(array $data, Client $user): array
    {
        if (! empty($data['address_id'])) {
            $address = Address::where('id', $data['address_id'])
                ->where('client_id', $user->id)
                ->firstOrFail();

            return [
                'line1' => $address->line1,
                'line2' => $address->line2,
                'city' => $address->city,
                'province' => $address->province,
                'postal_code' => $address->postal_code,
                'country' => $address->country ?? 'CA',
                'latitude' => $address->latitude,
                'longitude' => $address->longitude,
                'phone' => $user->phone,
            ];
        }

        $addr = $data['shipping_address'];
        foreach (['line1', 'city', 'postal_code', 'country'] as $field) {
            if (empty($addr[$field])) {
                abort(422, "Shipping address {$field} is required.");
            }
        }

        return array_merge($addr, ['phone' => $user->phone]);
    }
}
