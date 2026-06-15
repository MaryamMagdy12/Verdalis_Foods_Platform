<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_status' => 'required|in:pending,processing,paid,failed,cancelled,refunded',
            'note' => 'nullable|string|max:500',
        ];
    }
}
