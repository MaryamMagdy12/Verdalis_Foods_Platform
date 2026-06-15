<?php

namespace App\Services;

use App\Models\Order;
use InvalidArgumentException;

class OrderStateMachine
{
    /** @var array<string, list<string>> */
    private const TRANSITIONS = [
        'pending_payment' => ['paid', 'cancelled'],
        'paid' => ['preparing', 'cancelled'],
        'preparing' => ['ready_for_pickup'],
        'ready_for_pickup' => ['picked_up', 'cancelled'],
        'picked_up' => ['out_for_delivery'],
        'out_for_delivery' => ['delivered', 'failed_delivery'],
        'failed_delivery' => ['out_for_delivery', 'returned'],
        'delivered' => [],
        'cancelled' => [],
        'returned' => [],
    ];

    public function canTransition(Order $order, string $newStatus): bool
    {
        $current = $order->status;

        return in_array($newStatus, self::TRANSITIONS[$current] ?? [], true);
    }

    public function assertCanTransition(Order $order, string $newStatus): void
    {
        if (! $this->canTransition($order, $newStatus)) {
            throw new InvalidArgumentException(
                "Cannot transition order {$order->order_number} from {$order->status} to {$newStatus}."
            );
        }
    }

    public function allowedTransitions(Order $order): array
    {
        return self::TRANSITIONS[$order->status] ?? [];
    }

    public function isValidStatus(string $status): bool
    {
        return array_key_exists($status, self::TRANSITIONS);
    }
}
