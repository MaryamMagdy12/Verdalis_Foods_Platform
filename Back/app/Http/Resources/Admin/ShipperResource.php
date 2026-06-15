<?php

namespace App\Http\Resources\Admin;

use App\Support\ShipperPin;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShipperResource extends JsonResource
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
            'shipper_pin' => ShipperPin::forAdminDisplay($this->shipper_pin),
            'pin_is_hashed' => ShipperPin::isHashed($this->shipper_pin),
            'shipper_identity' => $this->shipper_identity,
            'shipper_identity_url' => $this->shipper_identity
                ? '/api/admin/shippers/'.$this->id.'/identity'
                : null,
            'shipper_certificates' => $this->shipper_certificates,
            'shipper_certificate_urls' => collect($this->shipper_certificates ?? [])
                ->values()
                ->map(fn ($path, $index) => '/api/admin/shippers/'.$this->id.'/certificates/'.$index)
                ->all(),
            'photo' => $this->photo,
            'photo_url' => $this->photo ? asset('storage/'.$this->photo) : null,
            'has_pin' => ! empty($this->shipper_pin),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
