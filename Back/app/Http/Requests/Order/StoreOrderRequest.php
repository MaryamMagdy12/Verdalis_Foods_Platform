<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:online,cod,bank_transfer,invoice',
            'address_id' => 'nullable|exists:addresses,id',
            'shipping_address' => 'required_without:address_id|array',
            'shipping_address.line1' => 'required_without:address_id|string|max:255',
            'shipping_address.city' => 'required_without:address_id|string|max:100',
            'shipping_address.postal_code' => 'required_without:address_id|string|max:20',
            'shipping_address.country' => 'required_without:address_id|string|size:2',
            'shipping_address.line2' => 'nullable|string|max:255',
            'shipping_address.province' => 'nullable|string|max:100',
            'shipping_address.latitude' => 'nullable|numeric',
            'shipping_address.longitude' => 'nullable|numeric',
            'coupon_code' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
