<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentOrderResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'client_name' => $this->whenLoaded('client', fn () => $this->client?->name),
            'client_email' => $this->whenLoaded('client', fn () => $this->client?->email),
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'total' => (float) $this->total,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
        ];
    }
}
