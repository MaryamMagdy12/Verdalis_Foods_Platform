<?php

namespace App\Providers;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureRateLimiting();

        if (! app()->environment('production')) {
            $this->ensureAdminFromEnv();
        }
    }

    private function configureRateLimiting(): void
    {
        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(5)->by($request->ip().'|'.($request->input('email') ?? '')));
        RateLimiter::for('otp', fn (Request $request) => Limit::perMinute(10)->by($request->ip().'|'.($request->input('email') ?? '')));
        RateLimiter::for('track', fn (Request $request) => Limit::perMinute(10)->by($request->ip()));
        RateLimiter::for('deliver', fn (Request $request) => Limit::perMinute(8)->by($request->user()?->id ?? $request->ip()));
        RateLimiter::for('shipper-scan', fn (Request $request) => Limit::perMinute(15)->by($request->user()?->id ?? $request->ip()));
        RateLimiter::for('contact', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));
        RateLimiter::for('password-reset', fn (Request $request) => Limit::perMinute(3)->by($request->ip().'|'.($request->input('email') ?? '')));
    }

    private function ensureAdminFromEnv(): void
    {
        $email = config('app.admin_email');
        $password = config('app.admin_password');
        $name = config('app.admin_name');

        if (! $email || ! $password) {
            return;
        }

        if (! Schema::hasColumn('users', 'is_env_admin')) {
            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name ?: 'Admin',
                    'password' => Hash::make($password),
                    'is_admin' => true,
                ]
            );

            return;
        }

        $previousEmail = Setting::getValue('env_admin_email');

        if ($previousEmail && $previousEmail !== $email) {
            User::where('email', $previousEmail)
                ->where('is_env_admin', true)
                ->update([
                    'is_admin' => false,
                    'is_env_admin' => false,
                ]);
        }

        if (! $previousEmail) {
            User::where('is_admin', true)
                ->where('email', '!=', $email)
                ->update([
                    'is_admin' => false,
                    'is_env_admin' => false,
                ]);
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name ?: 'Admin',
                'password' => Hash::make($password),
                'is_admin' => true,
                'is_env_admin' => true,
            ]
        );

        Setting::setValue('env_admin_email', $email);
    }
}
