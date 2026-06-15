<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShipperOrderResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'total' => (float) $this->total,
            'item_count' => $this->whenLoaded('items', fn () => $this->items->sum('quantity'), 0),
            'client_name' => $this->whenLoaded('client', fn () => $this->client?->name),
            'client_phone' => $this->whenLoaded('client', fn () => $this->client?->phone),
            'address' => $this->shipping_address,
            'qr_payload' => $this->when($this->status === 'ready_for_pickup', $this->qr_payload),
            'payment_method' => $this->payment_method,
            'delivered_at' => $this->delivered_at?->toIso8601String(),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($i) => [
                'product_name' => $i->product_name,
                'quantity' => $i->quantity,
            ])),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
