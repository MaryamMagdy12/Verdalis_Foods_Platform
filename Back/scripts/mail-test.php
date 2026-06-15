<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;

$to = 'info@cbsremotly.com';
echo "Mailer: ".config('mail.default')."\n";
echo "From: ".config('mail.from.address')."\n";
echo "Sending to: {$to}\n";

try {
    Mail::to($to)->send(new OtpMail('999888', 'register'));
    echo "SEND_ACCEPTED_BY_SMTP\n";
} catch (Throwable $e) {
    echo 'SMTP_ERROR: '.$e->getMessage()."\n";
}

$otp = App\Models\EmailOtp::where('email', $to)->where('purpose', 'register')->orderByDesc('id')->first();
echo $otp ? "DB OTP expires: {$otp->expires_at}\n" : "No register OTP in DB\n";
