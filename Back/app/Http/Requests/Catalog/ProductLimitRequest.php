<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class ProductLimitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'limit' => 'nullable|integer|min:1|max:20',
        ];
    }

    public function limit(int $default, int $max): int
    {
        return min((int) $this->get('limit', $default), $max);
    }
}
