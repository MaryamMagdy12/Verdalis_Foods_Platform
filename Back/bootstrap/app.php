<?php

use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Application;
use App\Support\AuthCookie;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->encryptCookies(except: [
            AuthCookie::CLIENT,
            AuthCookie::ADMIN,
            AuthCookie::SHIPPER,
        ]);

        // Stateful Sanctum middleware must run before reading auth cookies (after EncryptCookies).
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \App\Http\Middleware\AuthenticateFromCookie::class,
        ]);

        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
            'admin.inactivity' => \App\Http\Middleware\AdminInactivityTimeout::class,
            'role' => \App\Http\Middleware\EnsureRole::class,
            'approved.retailer' => \App\Http\Middleware\EnsureApprovedRetailer::class,
        ]);

        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
