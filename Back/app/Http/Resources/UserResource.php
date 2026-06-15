<?php

namespace App\Http\Resources;

use App\Models\Shipper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role ?? ($this->resource instanceof Shipper ? 'shipper' : null),
            'phone' => $this->phone,
            'address' => $this->address,
            'personal_address' => $this->personal_address,
            'location_lat' => $this->location_lat ? (float) $this->location_lat : null,
            'location_lng' => $this->location_lng ? (float) $this->location_lng : null,
            'photo' => $this->photo,
            'photo_url' => $this->photo ? asset('storage/'.$this->photo) : null,
            'company_name' => $this->company_name,
            'store_name' => $this->store_name,
            'store_address' => $this->store_address,
            'retailer_status' => $this->retailer_status,
            'profile_complete' => (bool) $this->profile_complete,
            'is_retailer' => method_exists($this->resource, 'isRetailer') ? $this->isRetailer() : $this->role === 'retailer',
        ];

        if ($this->resource instanceof Shipper) {
            $data['has_pin'] = ! empty($this->shipper_pin);
            $data['shipper_identity_url'] = $this->shipper_identity
                ? asset('storage/'.$this->shipper_identity)
                : null;
            $data['shipper_certificate_urls'] = collect($this->shipper_certificates ?? [])
                ->map(fn ($path) => asset('storage/'.$path))
                ->values()
                ->all();
        }

        return $data;
    }
}
