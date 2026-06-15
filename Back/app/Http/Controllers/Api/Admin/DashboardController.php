<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Order;
use App\Models\Product;
use App\Models\Retailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function analytics(Request $request): JsonResponse
    {
        $days = min((int) $request->get('days', 30), 90);
        $since = now()->subDays($days);

        $revenue = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $since)
            ->sum('total');

        $ordersCount = Order::where('created_at', '>=', $since)->count();
        $delivered = Order::where('status', 'delivered')->where('created_at', '>=', $since)->count();
        $failed = Order::where('status', 'failed_delivery')->where('created_at', '>=', $since)->count();

        $salesByDay = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total) as revenue'),
            DB::raw('COUNT(*) as orders')
        )
            ->where('created_at', '>=', $since)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $statusBreakdown = Order::select('status', DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $since)
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'data' => [
                'revenue' => (float) $revenue,
                'orders_count' => $ordersCount,
                'delivered_count' => $delivered,
                'failed_delivery_count' => $failed,
                'clients_count' => Client::count(),
                'retailers_pending' => Retailer::where('retailer_status', 'pending')->count(),
                'low_stock_count' => Product::where('stock', '<=', 20)->count(),
                'sales_by_day' => $salesByDay,
                'status_breakdown' => $statusBreakdown,
            ],
        ]);
    }
}
