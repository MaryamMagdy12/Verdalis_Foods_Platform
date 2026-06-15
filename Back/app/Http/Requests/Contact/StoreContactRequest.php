<?php

namespace App\Http\Requests\Contact;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'message' => 'required|string',
            'phone' => ['required', 'string', 'max:50', 'regex:/^[0-9]+$/'],
            'address' => 'required|string',
            'email' => 'nullable|email',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please enter your name.',
            'company_name.required' => 'Please enter your company name.',
            'message.required' => 'Please enter your message.',
            'phone.required' => 'Please enter your phone number.',
            'phone.regex' => 'Phone number must contain only digits (0-9).',
            'address.required' => 'Please enter your address.',
            'email.email' => 'Please enter a valid email address.',
        ];
    }
}
