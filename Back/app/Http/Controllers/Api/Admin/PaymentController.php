<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PaymentIndexRequest;
use App\Http\Requests\Admin\UpdatePaymentStatusRequest;
use App\Http\Resources\Admin\AdminOrderResource;
use App\Http\Resources\Admin\PaymentOrderResource;
use App\Models\Order;
use App\Services\AuditLogService;
use App\Services\OrderStateMachine;
use App\Services\PaymentService;
use App\Services\StockReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $payments,
        private AuditLogService $audit,
        private OrderStateMachine $stateMachine,
        private StockReservationService $stock,
    ) {}

    public function index(PaymentIndexRequest $request): JsonResponse
    {
        $query = Order::with('client:id,name,email,role');

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $orders = $query->orderByDesc('created_at')->paginate(30);

        $summary = Order::query()
            ->select('payment_status', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as total'))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('created_at', '>=', $request->from))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('created_at', '<=', $request->to))
            ->groupBy('payment_status')
            ->get();

        return response()->json([
            'data' => PaymentOrderResource::collection($orders->getCollection()),
            'summary' => $summary,
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function updateStatus(UpdatePaymentStatusRequest $request, Order $order): JsonResponse
    {
        $status = $request->validated('payment_status');
        $admin = $request->user();

        if ($status === 'paid' && in_array($order->payment_method, ['bank_transfer', 'invoice'], true)) {
            $order = $this->payments->confirmManualPayment($order, $admin, $request->input('note', ''));

            return response()->json(['data' => new AdminOrderResource($order->load(['client', 'shipper', 'items']))]);
        }

        $before = $order->payment_status;
        $order->update([
            'payment_status' => $status,
            'paid_at' => $status === 'paid' ? ($order->paid_at ?? now()) : $order->paid_at,
        ]);

        if ($status === 'failed' || $status === 'cancelled') {
            $this->stock->releaseReservation($order);
            if ($this->stateMachine->canTransition($order, 'cancelled')) {
                $order->update(['status' => 'cancelled']);
            }
        }

        $this->audit->log('payment_status_changed', $admin, Order::class, $order->id, [
            'before' => $before,
            'after' => $status,
        ]);

        return response()->json(['data' => new AdminOrderResource($order->fresh()->load(['client', 'shipper', 'items']))]);
    }

    public function confirm(Request $request, Order $order): JsonResponse
    {
        $request->validate(['note' => 'nullable|string|max:500']);

        $order = $this->payments->confirmManualPayment($order, $request->user(), $request->input('note', ''));

        return response()->json(['data' => new AdminOrderResource($order->load(['client', 'shipper', 'items']))]);
    }
}
