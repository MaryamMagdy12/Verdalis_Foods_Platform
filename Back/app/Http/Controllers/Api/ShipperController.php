<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shipper\ConfirmManualPickupRequest;
use App\Http\Requests\Shipper\DeliverOrderRequest;
use App\Http\Requests\Shipper\FailedDeliveryRequest;
use App\Http\Requests\Shipper\PickupOrderRequest;
use App\Http\Requests\Shipper\RequestManualPickupRequest;
use App\Http\Resources\ShipperOrderResource;
use App\Models\Order;
use App\Services\AuditLogService;
use App\Services\DeliveryOtpService;
use App\Services\GpsValidator;
use App\Services\OrderService;
use App\Services\PickupManualService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShipperController extends Controller
{
    public function __construct(
        private OrderService $orders,
        private DeliveryOtpService $deliveryOtp,
        private PickupManualService $pickupManual,
        private GpsValidator $gps,
        private AuditLogService $audit,
    ) {}

    public function todayOrders(Request $request): JsonResponse
    {
        $orders = Order::with(['items', 'client'])
            ->where('shipper_id', $request->user()->id)
            ->whereIn('status', ['ready_for_pickup', 'picked_up', 'out_for_delivery'])
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => ShipperOrderResource::collection($orders)]);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->shipper_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not assigned to you.'], 403);
        }

        $order->load(['items', 'client']);

        $otpSent = false;
        if (in_array($order->status, ['picked_up', 'out_for_delivery'], true)) {
            $otpSent = $this->orders->ensureDeliveryOtpEmail($order);
            $order = $order->fresh()->load(['items', 'client']);
        }

        return response()->json([
            'data' => new ShipperOrderResource($order),
            'delivery_otp_sent' => $otpSent,
        ]);
    }

    public function scanPickup(PickupOrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        $shipper = $request->user();

        if (! $shipper->is_active) {
            return response()->json(['message' => 'Shipper account is inactive.'], 403);
        }

        try {
            $this->gps->validate(
                (float) $data['latitude'],
                (float) $data['longitude'],
                isset($data['accuracy']) ? (float) $data['accuracy'] : null
            );
            $order = $this->orders->resolveOrderFromQr($data['qr_payload']);
        } catch (\InvalidArgumentException $e) {
            $this->audit->log('qr_scan_failed', $shipper, Order::class, null, [
                'reason' => $e->getMessage(),
            ]);

            return response()->json(['message' => $e->getMessage()], 422);
        }

        $error = $this->assertPickupAllowed($order, $shipper);
        if ($error) {
            return $error;
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('delivery/pickup', 'public');
        }

        return $this->finalizePickup($order, $shipper, [
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'pickup_photo' => $photoPath,
            'photo' => $photoPath,
            'gps_accuracy' => $data['accuracy'] ?? null,
        ], 'qr');
    }

    public function requestManualPickup(RequestManualPickupRequest $request): JsonResponse
    {
        $data = $request->validated();
        $shipper = $request->user();

        if (! $shipper->is_active) {
            return response()->json(['message' => 'Shipper account is inactive.'], 403);
        }

        $order = Order::where('order_number', $data['order_number'])->firstOrFail();
        $error = $this->assertPickupAllowed($order, $shipper);
        if ($error) {
            return $error;
        }

        try {
            $this->pickupManual->issueSerial(
                $order,
                $shipper,
                $data['password'],
                $data['pin'],
                $data['truck_number']
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }

        $this->audit->log('manual_pickup_serial_sent', $shipper, Order::class, $order->id, [
            'order_number' => $order->order_number,
            'truck_number' => $data['truck_number'],
        ]);

        return response()->json([
            'message' => 'One-time pickup serial sent to your shipper email.',
            'email' => $shipper->email,
        ]);
    }

    public function confirmManualPickup(ConfirmManualPickupRequest $request): JsonResponse
    {
        $data = $request->validated();
        $shipper = $request->user();

        if (! $shipper->is_active) {
            return response()->json(['message' => 'Shipper account is inactive.'], 403);
        }

        $order = Order::where('order_number', $data['order_number'])->firstOrFail();
        $error = $this->assertPickupAllowed($order, $shipper);
        if ($error) {
            return $error;
        }

        try {
            $this->gps->validate(
                (float) $data['latitude'],
                (float) $data['longitude'],
                isset($data['accuracy']) ? (float) $data['accuracy'] : null
            );
            $this->pickupManual->verifySerial($order, $shipper, $data['serial']);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('delivery/pickup', 'public');
        }

        return $this->finalizePickup($order->fresh(), $shipper, [
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'pickup_photo' => $photoPath,
            'photo' => $photoPath,
            'gps_accuracy' => $data['accuracy'] ?? null,
        ], 'manual');
    }

    private function assertPickupAllowed(Order $order, $shipper): ?JsonResponse
    {
        if (! $order->shipper_id) {
            return response()->json(['message' => 'Order must be assigned by admin before pickup.'], 403);
        }

        if ($order->shipper_id !== $shipper->id) {
            return response()->json(['message' => 'Order not assigned to you.'], 403);
        }

        if ($order->status !== 'ready_for_pickup') {
            return response()->json(['message' => 'Order is not ready for pickup.'], 422);
        }

        return null;
    }

    /** @param  array<string, mixed>  $gpsData */
    private function finalizePickup(Order $order, $shipper, array $gpsData, string $method): JsonResponse
    {
        $this->orders->transition($order, 'picked_up', $shipper, [
            'latitude' => $gpsData['latitude'],
            'longitude' => $gpsData['longitude'],
            'pickup_photo' => $gpsData['pickup_photo'] ?? null,
            'photo' => $gpsData['photo'] ?? null,
            'gps_accuracy' => $gpsData['gps_accuracy'] ?? null,
        ]);

        $this->orders->transition($order->fresh(), 'out_for_delivery', $shipper);

        $order = $order->fresh()->load(['items', 'client']);
        $this->orders->refreshDeliveryOtp($order);
        $sent = $this->orders->sendDeliveryOtpEmail($order->fresh());

        $this->orders->notifyAccount($shipper, 'assignment', 'Pickup confirmed', "Order {$order->order_number} picked up.");

        $this->audit->log('pickup_confirmed', $shipper, Order::class, $order->id, [
            'order_number' => $order->order_number,
            'method' => $method,
            'latitude' => $gpsData['latitude'],
            'longitude' => $gpsData['longitude'],
            'truck_number' => $order->pickup_truck_number,
        ]);

        return response()->json([
            'data' => new ShipperOrderResource($order->fresh()->load(['items', 'client'])),
            'delivery_otp_sent' => $sent,
        ]);
    }

    public function confirmDelivery(DeliverOrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        $shipper = $request->user();

        if ($this->deliveryOtp->isLocked($order = Order::where('order_number', $data['order_number'])->firstOrFail())) {
            return response()->json(['message' => $this->deliveryOtp->lockoutMessage($order)], 429);
        }

        if ($order->shipper_id !== $shipper->id) {
            return response()->json(['message' => 'Order not assigned to you.'], 403);
        }

        if (! $this->deliveryOtp->verify($order, $data['otp'])) {
            $this->audit->log('delivery_otp_failed', $shipper, Order::class, $order->id, [
                'attempts' => $order->fresh()->delivery_otp_attempts,
            ]);

            $message = $this->deliveryOtp->lockoutMessage($order->fresh()) ?? 'Invalid delivery OTP.';

            return response()->json(['message' => $message], 422);
        }

        if (! in_array($order->status, ['picked_up', 'out_for_delivery'], true)) {
            return response()->json(['message' => 'Order cannot be delivered in current status.'], 422);
        }

        try {
            $this->gps->validate(
                (float) $data['latitude'],
                (float) $data['longitude'],
                isset($data['accuracy']) ? (float) $data['accuracy'] : null
            );
            $this->gps->assertWithinDeliveryRadius($order, (float) $data['latitude'], (float) $data['longitude']);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('delivery/proof', 'public');
        }

        $this->orders->transition($order, 'delivered', $shipper, [
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'delivery_photo' => $photoPath,
            'delivery_signature' => $data['signature'] ?? null,
            'photo' => $photoPath,
            'gps_accuracy' => $data['accuracy'] ?? null,
        ]);

        if ($order->payment_method === 'cod') {
            $order->update(['payment_status' => 'paid', 'paid_at' => now()]);
        }

        $this->audit->log('delivery_confirmed', $shipper, Order::class, $order->id, [
            'order_number' => $order->order_number,
        ]);

        return response()->json(['data' => new ShipperOrderResource($order->fresh())]);
    }

    public function failedDelivery(FailedDeliveryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $order = Order::where('order_number', $data['order_number'])->firstOrFail();

        if ($order->shipper_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not assigned to you.'], 403);
        }

        $this->orders->transition($order, 'failed_delivery', $request->user(), [
            'failure_reason' => $data['reason'],
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
        ]);

        $this->audit->log('delivery_failed', $request->user(), Order::class, $order->id, [
            'reason' => $data['reason'],
        ]);

        return response()->json(['data' => new ShipperOrderResource($order->fresh())]);
    }

    public function history(Request $request): JsonResponse
    {
        $orders = Order::with('client')
            ->where('shipper_id', $request->user()->id)
            ->whereIn('status', ['delivered', 'failed_delivery', 'returned'])
            ->orderByDesc('delivered_at')
            ->limit(50)
            ->get();

        return response()->json(['data' => ShipperOrderResource::collection($orders)]);
    }

    public function performance(Request $request): JsonResponse
    {
        $shipperId = $request->user()->id;
        $delivered = Order::where('shipper_id', $shipperId)->where('status', 'delivered')->count();
        $failed = Order::where('shipper_id', $shipperId)->where('status', 'failed_delivery')->count();
        $today = Order::where('shipper_id', $shipperId)->whereDate('delivered_at', today())->count();

        return response()->json([
            'data' => [
                'delivered_total' => $delivered,
                'failed_total' => $failed,
                'delivered_today' => $today,
                'success_rate' => $delivered + $failed > 0 ? round($delivered / ($delivered + $failed) * 100, 1) : 100,
            ],
        ]);
    }

    public function resendDeliveryOtp(Request $request, Order $order): JsonResponse
    {
        if ($order->shipper_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not assigned to you.'], 403);
        }

        if (! in_array($order->status, ['picked_up', 'out_for_delivery'], true)) {
            return response()->json(['message' => 'Delivery code can only be sent for active deliveries.'], 422);
        }

        $order->load('client');
        if (! $order->client?->email) {
            return response()->json(['message' => 'Client has no email on file.'], 422);
        }

        $this->orders->refreshDeliveryOtp($order);
        $sent = $this->orders->sendDeliveryOtpEmail($order->fresh());

        if (! $sent) {
            return response()->json(['message' => 'Could not send email. Check mail settings and try again.'], 500);
        }

        $this->audit->log('delivery_otp_resent', $request->user(), Order::class, $order->id);

        return response()->json(['message' => 'Delivery code sent to client email on file.']);
    }
}
