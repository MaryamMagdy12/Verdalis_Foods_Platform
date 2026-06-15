<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$ok = app(App\Services\OtpService::class)->resend('info@cbsremotly.com', 'register');
echo $ok ? "RESEND_OK\n" : "NO_PENDING_OTP\n";
