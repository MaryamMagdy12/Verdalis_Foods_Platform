<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\OrderItemResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
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
            'shipping_address' => $this->shipping_address,
            'shipping_address_text' => $this->formatShippingAddress(),
            'created_at' => $this->created_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'user' => $this->whenLoaded('client', fn () => new UserResource($this->client)),
            'shipper_id' => $this->shipper_id,
            'shipper' => $this->whenLoaded('shipper', fn () => new UserResource($this->shipper)),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'delivery_events' => $this->whenLoaded('deliveryEvents'),
        ];
    }

    private function formatShippingAddress(): ?string
    {
        $addr = $this->shipping_address;
        if (! is_array($addr)) {
            return is_string($addr) ? $addr : null;
        }

        $parts = array_filter([
            $addr['line1'] ?? $addr['street'] ?? $addr['address'] ?? null,
            $addr['city'] ?? null,
            $addr['state'] ?? null,
            $addr['postal_code'] ?? null,
            $addr['country'] ?? null,
        ]);

        return $parts ? implode(', ', $parts) : null;
    }
}
