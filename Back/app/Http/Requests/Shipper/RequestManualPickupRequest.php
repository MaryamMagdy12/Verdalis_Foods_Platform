<?php

namespace App\Http\Requests\Shipper;

use Illuminate\Foundation\Http\FormRequest;

class RequestManualPickupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_number' => 'required|string|max:50',
            'truck_number' => 'required|string|max:64',
            'password' => 'required|string',
            'pin' => 'required|string|max:32',
        ];
    }
}
