<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PaymentIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_status' => 'nullable|in:pending,paid,failed,refunded',
            'from' => 'nullable|date',
            'to' => 'nullable|date',
        ];
    }
}
