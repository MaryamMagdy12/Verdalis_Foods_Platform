<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class StockReservationService
{
    public function reserveForOrder(Order $order, array $lineItems): void
    {
        foreach ($lineItems as $li) {
            /** @var Product $product */
            $product = $li['product'];
            $qty = (int) $li['quantity'];

            $product->refresh();
            $available = $product->stock - (int) $product->stock_reserved;

            if ($qty > $available) {
                throw new InvalidArgumentException("Insufficient stock for {$product->name}.");
            }

            $product->increment('stock_reserved', $qty);
        }

        $order->update(['stock_reserved_at' => now()]);
    }

    public function commitReservation(Order $order): void
    {
        if (! $order->stock_reserved_at) {
            return;
        }

        DB::transaction(function () use ($order) {
            $order->load('items');
            foreach ($order->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                if (! $product) {
                    continue;
                }
                $product->decrement('stock', $item->quantity);
                $product->decrement('stock_reserved', min($item->quantity, (int) $product->stock_reserved));
            }
            $order->update(['stock_reserved_at' => null]);
        });
    }

    public function releaseReservation(Order $order): void
    {
        if (! $order->stock_reserved_at) {
            return;
        }

        DB::transaction(function () use ($order) {
            $order->load('items');
            foreach ($order->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                if (! $product) {
                    continue;
                }
                $product->decrement('stock_reserved', min($item->quantity, (int) $product->stock_reserved));
            }
            $order->update(['stock_reserved_at' => null]);
        });
    }
}
