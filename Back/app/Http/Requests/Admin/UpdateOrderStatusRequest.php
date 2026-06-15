<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in([
                'pending_payment',
                'paid',
                'preparing',
                'ready_for_pickup',
                'picked_up',
                'out_for_delivery',
                'delivered',
                'failed_delivery',
                'cancelled',
                'returned',
            ])],
        ];
    }
}
