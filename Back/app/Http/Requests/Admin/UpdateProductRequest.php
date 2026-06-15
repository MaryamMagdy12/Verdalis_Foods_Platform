<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'sometimes|string|max:100',
            'price' => 'sometimes|numeric|min:0',
            'wholesale_price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'min_quantity' => 'nullable|integer|min:1',
            'wholesale_min_quantity' => 'nullable|integer|min:1',
            'image' => 'nullable|image|max:7168',
            'highlighted' => 'sometimes|boolean',
            'featured' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ];
    }
}
