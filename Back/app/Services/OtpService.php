<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\EmailOtp;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    public const TTL_MINUTES = 15;

    public function send(string $email, string $purpose, ?array $payload = null): void
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        EmailOtp::where('email', $email)->where('purpose', $purpose)->delete();

        $otp = EmailOtp::create([
            'email' => $email,
            'code' => $code,
            'purpose' => $purpose,
            'payload' => $payload,
            'expires_at' => now()->addMinutes(self::TTL_MINUTES),
        ]);

        try {
            Mail::to($email)->send(new OtpMail($code, $purpose));
        } catch (\Throwable $e) {
            Log::error('OTP mail failed', [
                'email' => $email,
                'purpose' => $purpose,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }

        if (config('app.debug')) {
            Log::info('OTP sent (local debug)', [
                'email' => $email,
                'purpose' => $purpose,
                'code' => $code,
                'expires_at' => $otp->expires_at?->toIso8601String(),
            ]);
        }
    }

    public function resend(string $email, string $purpose): bool
    {
        $otp = EmailOtp::where('email', $email)
            ->where('purpose', $purpose)
            ->where('expires_at', '>', now())
            ->orderByDesc('id')
            ->first();

        if (! $otp) {
            return false;
        }

        $this->send($email, $purpose, $otp->payload);

        return true;
    }

    public function verify(string $email, string $purpose, string $code): ?EmailOtp
    {
        $otp = EmailOtp::where('email', $email)
            ->where('purpose', $purpose)
            ->orderByDesc('id')
            ->first();

        if (! $otp || ! $otp->isValid($code)) {
            return null;
        }

        $otp->delete();

        return $otp;
    }
}
