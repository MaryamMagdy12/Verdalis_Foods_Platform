<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(self), geolocation=(self), microphone=()');

        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        $apiUrl = rtrim((string) config('app.url'), '/');
        $frontendUrls = array_filter([
            config('frontend.client_url'),
            config('frontend.admin_url'),
            config('frontend.shipper_url'),
        ]);
        $connectSrc = array_unique(array_merge(
            ["'self'", $apiUrl, 'https://api.stripe.com', 'https://nominatim.openstreetmap.org', 'https://*.basemaps.cartocdn.com'],
            $frontendUrls
        ));
        $csp = implode('; ', [
            "default-src 'self'",
            "script-src 'self' https://accounts.google.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            'connect-src '.implode(' ', $connectSrc),
            "frame-ancestors 'none'",
        ]);
        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
