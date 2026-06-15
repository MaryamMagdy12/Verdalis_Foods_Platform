<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShipperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $shipperId = $this->route('shipper')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:shippers,email,'.$shipperId],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'shipper_pin' => ['sometimes', 'nullable', 'string', 'max:32'],
            'password' => ['sometimes', 'string', 'min:8'],
            'identity' => ['sometimes', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:5120'],
            'certificates' => ['sometimes', 'array'],
            'certificates.*' => ['file', 'mimes:jpeg,jpg,png,pdf', 'max:5120'],
            'photo' => ['sometimes', 'image', 'max:5120'],
        ];
    }
}
