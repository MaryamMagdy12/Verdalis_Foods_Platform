<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssignShipperRequest;
use App\Http\Requests\Admin\OrderIndexRequest;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Models\Shipper;
use App\Http\Resources\Admin\AdminOrderResource;
use App\Models\Order;
use App\Services\AuditLogService;
use App\Services\OrderService;
use App\Services\OrderStateMachine;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orders,
        private OrderStateMachine $stateMachine,
        private AuditLogService $audit,
    ) {}

    public function index(OrderIndexRequest $request): JsonResponse
    {
        $query = Order::with(['client', 'shipper', 'items']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        if ($request->filled('shipper_id')) {
            $query->where('shipper_id', $request->shipper_id);
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }
        if ($request->filled('client_type')) {
            $query->where('is_wholesale', $request->client_type === 'retailer');
        }

        $orders = $query->orderByDesc('created_at')->paginate(25);

        return response()->json([
            'data' => AdminOrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['client', 'shipper', 'items', 'deliveryEvents.shipper']);

        return response()->json(['data' => new AdminOrderResource($order)]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $newStatus = $request->validated('status');
        $admin = $request->user();

        if (! $this->stateMachine->canTransition($order, $newStatus)) {
            return response()->json([
                'message' => "Cannot transition from {$order->status} to {$newStatus}.",
                'allowed' => $this->stateMachine->allowedTransitions($order),
            ], 422);
        }

        $this->orders->transition($order, $newStatus, $admin);

        $this->audit->log('order_status_changed', $admin, Order::class, $order->id, [
            'status' => $newStatus,
        ]);

        return response()->json([
            'data' => new AdminOrderResource($order->fresh()->load(['client', 'shipper', 'items'])),
        ]);
    }

    public function assignShipper(AssignShipperRequest $request, Order $order): JsonResponse
    {
        $shipper = Shipper::findOrFail($request->validated('shipper_id'));

        if (! $shipper->is_active) {
            return response()->json(['message' => 'Selected shipper is inactive.'], 422);
        }

        $order->update(['shipper_id' => $shipper->id]);
        $this->orders->notifyAccount(
            $shipper,
            'order_assigned',
            'New delivery assigned',
            "Order {$order->order_number} has been assigned to you."
        );

        $this->audit->log('shipper_assigned', $request->user(), Order::class, $order->id, [
            'shipper_id' => $shipper->id,
        ]);

        return response()->json([
            'data' => new AdminOrderResource($order->fresh()->load(['client', 'shipper', 'items'])),
        ]);
    }
}
