<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class StockAlertController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->where('is_active', true)
            ->whereNotNull('stock')
            ->orderBy('stock')
            ->get();

        $alerts = [
            'low' => [],
            'half' => [],
            'quarter' => [],
        ];

        $uniqueProducts = [];

        foreach ($products as $product) {
            $stock = (int) $product->stock;
            $initial = max((int) ($product->initial_stock ?? $stock), 1);
            $item = array_merge((new AdminProductResource($product))->resolve(), [
                'stock_percent' => round(($stock / $initial) * 100, 1),
            ]);

            $levels = [];

            if ($stock <= 20) {
                $levels[] = 'low';
                $alerts['low'][] = array_merge($item, [
                    'alert_level' => 'low',
                    'alert_label' => '20 or less',
                ]);
            }

            if ($stock <= (int) floor($initial * 0.5)) {
                $levels[] = 'half';
                $alerts['half'][] = array_merge($item, [
                    'alert_level' => 'half',
                    'alert_label' => 'Half stock',
                ]);
            }

            if ($stock <= (int) floor($initial * 0.25)) {
                $levels[] = 'quarter';
                $alerts['quarter'][] = array_merge($item, [
                    'alert_level' => 'quarter',
                    'alert_label' => 'Quarter stock',
                ]);
            }

            if ($levels !== []) {
                $uniqueProducts[$product->id] = array_merge($item, [
                    'alert_levels' => $levels,
                ]);
            }
        }

        $uniqueCount = count($uniqueProducts);

        return response()->json([
            'data' => $alerts,
            'products' => array_values($uniqueProducts),
            'meta' => [
                'total' => $uniqueCount,
                'unique_count' => $uniqueCount,
                'low_count' => count($alerts['low']),
                'half_count' => count($alerts['half']),
                'quarter_count' => count($alerts['quarter']),
            ],
        ]);
    }
}
