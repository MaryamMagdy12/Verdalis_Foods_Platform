<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function __construct($resource, protected bool $detailed = false)
    {
        parent::__construct($resource);
    }

    public function detailed(bool $value = true): static
    {
        $this->detailed = $value;

        return $this;
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $base = [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'subtotal' => (float) $this->subtotal,
            'tax' => (float) $this->tax,
            'shipping' => (float) $this->shipping,
            'discount' => (float) $this->discount,
            'total' => (float) $this->total,
            'is_wholesale' => (bool) $this->is_wholesale,
            'created_at' => $this->created_at?->toIso8601String(),
            'item_count' => $this->whenLoaded('items', fn () => $this->items->sum('quantity'), 0),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'delivery_otp_email_sent' => (bool) $this->delivery_otp_sent_at,
        ];

        if ($this->detailed) {
            $owner = $request->user('sanctum') ?? $request->user();
            if ($owner instanceof \App\Models\Client && $this->client_id === $owner->id) {
                $base['shipping_address'] = $this->shipping_address;
                $base['tracking_token'] = $this->tracking_token;
            }
            $base['timeline'] = $this->whenLoaded('deliveryEvents', fn () => $this->deliveryEvents->map(fn ($e) => [
                'type' => $e->event_type,
                'status_after' => $e->status_after,
                'created_at' => $e->created_at?->toIso8601String(),
            ]));
            $base['status_steps'] = $this->statusSteps($this->status);
        }

        return $base;
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
