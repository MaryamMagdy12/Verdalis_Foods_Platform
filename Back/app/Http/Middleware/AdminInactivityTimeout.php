<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminInactivityTimeout
{
    /** Inactivity limit in minutes. */
    private const TIMEOUT_MINUTES = 60;

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->user()?->currentAccessToken();
        if (! $token) {
            return $next($request);
        }

        $lastUsed = $token->last_used_at ?? $token->created_at;
        if (Carbon::parse($lastUsed)->diffInMinutes(now(), absolute: true) >= self::TIMEOUT_MINUTES) {
            $token->delete();
            return response()->json(['message' => 'Session expired due to inactivity. Please log in again.'], 401);
        }

        return $next($request);
    }
}
