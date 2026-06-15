<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $role = $this->input('role', 'client');

        $rules = [
            'name' => 'required|string|max:120',
            'email' => ['required', 'email', function ($attribute, $value, $fail) {
                if (\App\Models\Client::withoutGlobalScopes()->where('email', $value)->exists()
                    || \App\Models\Shipper::where('email', $value)->exists()
                    || \App\Models\User::where('email', $value)->exists()) {
                    $fail('This email is already registered.');
                }
            }],
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|max:30',
            'role' => ['nullable', Rule::in(['client', 'retailer'])],
            'location_lat' => 'nullable|numeric',
            'location_lng' => 'nullable|numeric',
            'photo' => 'nullable|string|max:500',
        ];

        if ($role === 'retailer') {
            $rules['personal_address'] = 'required|string|max:500';
            $rules['store_name'] = 'required|string|max:200';
            $rules['store_address'] = 'required|string|max:500';
        } else {
            $rules['address'] = 'required|string|max:500';
        }

        return $rules;
    }
}
