<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicOrderTrackResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'order_number' => $this->order_number,
            'status' => $this->status,
            'payment_status' => $this->when(
                $request->user('sanctum') instanceof \App\Models\Client
                    && $this->client_id === $request->user('sanctum')->id,
                $this->payment_status
            ),
            'estimated_delivery' => $this->estimatedDeliveryLabel(),
            'timeline' => $this->whenLoaded('deliveryEvents', fn () => $this->deliveryEvents->map(fn ($e) => [
                'type' => $e->event_type,
                'status_after' => $e->status_after,
                'created_at' => $e->created_at?->toIso8601String(),
            ])),
            'status_steps' => $this->statusSteps($this->status),
        ];
    }

    private function estimatedDeliveryLabel(): ?string
    {
        return match ($this->status) {
            'pending_payment' => 'Awaiting payment confirmation',
            'paid', 'preparing' => 'Preparing your order',
            'ready_for_pickup' => 'Ready for pickup',
            'picked_up', 'out_for_delivery' => 'Out for delivery today',
            'delivered' => 'Delivered',
            'failed_delivery' => 'Delivery attempt failed — we will contact you',
            'cancelled' => 'Order cancelled',
            default => null,
        };
    }

    /** @return list<array<string, mixed>> */
    private function statusSteps(string $current): array
    {
        $steps = ['pending_payment', 'paid', 'preparing', 'ready_for_pickup', 'picked_up', 'out_for_delivery', 'delivered'];
        $idx = array_search($current, $steps, true);

        return array_map(fn ($s) => [
            'key' => $s,
            'label' => ucwords(str_replace('_', ' ', $s)),
            'done' => $idx !== false && array_search($s, $steps, true) <= $idx,
            'current' => $s === $current,
        ], $steps);
    }
}
