<?php

namespace App\Http\Requests\Order;

use App\Models\Client;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;

class TrackOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_number' => 'required|string|max:50',
            'tracking_token' => 'nullable|string|size:64',
            'phone_last4' => 'nullable|string|size:4|regex:/^\d{4}$/',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->ownsOrder()) {
                return;
            }

            if (empty($this->input('tracking_token'))) {
                $validator->errors()->add('tracking_token', 'Tracking token is required.');
            }

            if (empty($this->input('phone_last4'))) {
                $validator->errors()->add('phone_last4', 'Phone last 4 digits are required.');
            }
        });
    }

    private function ownsOrder(): bool
    {
        $orderNumber = $this->input('order_number');
        if (! $orderNumber) {
            return false;
        }

        $user = $this->user('sanctum');
        if (! $user instanceof Client) {
            return false;
        }

        return Order::query()
            ->where('order_number', $orderNumber)
            ->where('client_id', $user->id)
            ->exists();
    }
}
