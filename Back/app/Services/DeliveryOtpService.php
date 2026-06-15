<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DeliveryOtpService
{
    public const MAX_ATTEMPTS = 5;

    public const LOCKOUT_MINUTES = 15;

    public function generate(): string
    {
        return (string) random_int(100000, 999999);
    }

    public function setOtp(Order $order, ?string $plainOtp = null): string
    {
        $plainOtp ??= $this->generate();
        $order->delivery_otp_hash = Hash::make($plainOtp);
        $order->delivery_otp = null;
        $order->delivery_otp_attempts = 0;
        $order->delivery_otp_locked_until = null;
        $order->delivery_otp_verified_at = null;
        $order->save();

        return $plainOtp;
    }

    public function isLocked(Order $order): bool
    {
        return $order->delivery_otp_locked_until?->isFuture() ?? false;
    }

    public function verify(Order $order, string $otp): bool
    {
        if ($this->isLocked($order)) {
            return false;
        }

        if (! $order->delivery_otp_hash) {
            return false;
        }

        if (Hash::check($otp, $order->delivery_otp_hash)) {
            $order->update([
                'delivery_otp_attempts' => 0,
                'delivery_otp_locked_until' => null,
                'delivery_otp_verified_at' => now(),
            ]);

            return true;
        }

        $attempts = (int) $order->delivery_otp_attempts + 1;
        $updates = ['delivery_otp_attempts' => $attempts];

        if ($attempts >= self::MAX_ATTEMPTS) {
            $updates['delivery_otp_locked_until'] = now()->addMinutes(self::LOCKOUT_MINUTES);
        }

        $order->update($updates);

        return false;
    }

    public function lockoutMessage(Order $order): ?string
    {
        if (! $this->isLocked($order)) {
            return null;
        }

        return 'Too many failed attempts. Try again after '.$order->delivery_otp_locked_until->diffForHumans().'.';
    }
}
