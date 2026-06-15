<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientDetailResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'personal_address' => $this->personal_address,
            'role' => $this->role,
            'company_name' => $this->company_name,
            'store_name' => $this->store_name,
            'store_address' => $this->store_address,
            'retailer_status' => $this->retailer_status,
            'profile_complete' => (bool) $this->profile_complete,
            'location_lat' => $this->location_lat,
            'location_lng' => $this->location_lng,
            'created_at' => $this->created_at?->toIso8601String(),
            'orders' => $this->whenLoaded('orders', fn () => $this->orders->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'total' => (float) $order->total,
                'created_at' => $order->created_at?->toIso8601String(),
                'paid_at' => $order->paid_at?->toIso8601String(),
                'items' => $order->items?->map(fn ($item) => [
                    'product_name' => $item->product_name,
                    'quantity' => (int) $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'line_total' => (float) $item->line_total,
                ])->values()->all(),
            ])->values()->all()),
            'payments' => $this->whenLoaded('orders', fn () => $this->orders->map(fn ($order) => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'total' => (float) $order->total,
                'paid_at' => $order->paid_at?->toIso8601String(),
                'created_at' => $order->created_at?->toIso8601String(),
            ])->values()->all()),
        ];
    }
}
