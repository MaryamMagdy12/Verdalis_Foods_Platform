<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class ProductIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'nullable|integer|exists:categories,id',
            'featured' => 'nullable|boolean',
            'search' => 'nullable|string|max:120',
            'per_page' => 'nullable|integer|min:1|max:60',
            'page' => 'nullable|integer|min:1',
        ];
    }
}
