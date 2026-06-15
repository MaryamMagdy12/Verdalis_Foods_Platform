<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\AuditLogService;
use App\Services\StockReservationService;
use Illuminate\Console\Command;

class ReleaseStaleOrderReservations extends Command
{
    protected $signature = 'orders:release-stale-reservations {--hours=24}';

    protected $description = 'Release stock reservations for unpaid orders past the payment window';

    public function handle(StockReservationService $stock, AuditLogService $audit): int
    {
        $hours = (int) $this->option('hours');

        $orders = Order::query()
            ->where('payment_status', 'pending')
            ->where('status', 'pending_payment')
            ->whereNotNull('stock_reserved_at')
            ->where(function ($q) use ($hours) {
                $q->where('payment_expires_at', '<', now())
                    ->orWhere('created_at', '<', now()->subHours($hours));
            })
            ->get();

        foreach ($orders as $order) {
            $stock->releaseReservation($order);
            $order->update(['status' => 'cancelled']);
            $audit->log('order_payment_expired', null, Order::class, $order->id, [
                'order_number' => $order->order_number,
            ]);
        }

        $this->info('Released '.$orders->count().' stale reservations.');

        return self::SUCCESS;
    }
}
