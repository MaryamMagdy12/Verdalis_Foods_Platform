<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class CompleteProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:120',
            'phone' => 'required|string|max:30',
            'address' => 'required|string|max:500',
            'location_lat' => 'nullable|numeric',
            'location_lng' => 'nullable|numeric',
            'photo' => 'nullable|string|max:500',
            'password' => 'nullable|string|min:8|confirmed',
            'shipping_address' => 'nullable|array',
            'shipping_address.line1' => 'required_with:shipping_address|string|max:200',
            'shipping_address.city' => 'required_with:shipping_address|string|max:100',
            'shipping_address.postal_code' => 'required_with:shipping_address|string|max:20',
            'shipping_address.latitude' => 'nullable|numeric',
            'shipping_address.longitude' => 'nullable|numeric',
        ];
    }
}
