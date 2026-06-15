<?php

namespace App\Http\Middleware;

use App\Support\AuthCookie;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateFromCookie
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->bearerToken()) {
            $token = $this->resolveToken($request);
            if ($token) {
                $request->headers->set('Authorization', 'Bearer '.$token);
            }
        }

        return $next($request);
    }

    private function resolveToken(Request $request): ?string
    {
        $path = $request->path();

        if (str_starts_with($path, 'api/admin')) {
            $order = [AuthCookie::ADMIN, AuthCookie::CLIENT, AuthCookie::SHIPPER];
        } elseif (str_starts_with($path, 'api/shipper') || str_starts_with($path, 'api/auth/shipper')) {
            $order = [AuthCookie::SHIPPER, AuthCookie::CLIENT, AuthCookie::ADMIN];
        } else {
            $order = [AuthCookie::CLIENT, AuthCookie::ADMIN, AuthCookie::SHIPPER];
        }

        foreach ($order as $cookieName) {
            $token = $request->cookie($cookieName);
            if (is_string($token) && $token !== '') {
                return $token;
            }
        }

        return null;
    }
}
