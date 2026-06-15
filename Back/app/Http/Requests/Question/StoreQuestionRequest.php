<?php

namespace App\Http\Requests\Question;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => ['nullable', 'string', 'max:50', 'regex:/^[0-9]+$/'],
            'company_name' => 'nullable|string|max:255',
            'message' => 'required|string',
            'product_id' => 'nullable|exists:products,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please enter your name.',
            'email.email' => 'Please enter a valid email address.',
            'message.required' => 'Please enter your question.',
        ];
    }
}
