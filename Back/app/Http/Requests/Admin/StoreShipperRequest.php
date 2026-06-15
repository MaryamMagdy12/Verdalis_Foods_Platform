<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreShipperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:120',
            'email' => 'required|email|unique:shippers,email',
            'password' => 'required|string|min:8',
            'phone' => 'required|string|max:30',
            'address' => 'required|string|max:500',
            'shipper_pin' => 'required|string|max:32',
            'identity' => 'required|file|mimes:jpeg,jpg,png,pdf|max:5120',
            'certificates' => 'required|array|min:1',
            'certificates.*' => 'required|file|mimes:jpeg,jpg,png,pdf|max:5120',
            'photo' => 'required|image|max:5120',
        ];
    }
}
