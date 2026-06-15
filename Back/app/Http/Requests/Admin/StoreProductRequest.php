<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'min_quantity' => 'nullable|integer|min:1',
            'wholesale_min_quantity' => 'nullable|integer|min:1',
            'weight' => 'nullable|string|max:50',
            'size' => 'nullable|string|max:50',
            'image' => 'nullable|image|max:7168',
            'highlighted' => 'sometimes|boolean',
            'featured' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
        ];
    }
}
