<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class OrderIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'nullable|string',
            'payment_status' => 'nullable|string',
            'shipper_id' => 'nullable|integer|exists:shippers,id',
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'client_type' => 'nullable|in:client,retailer',
        ];
    }
}
