<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Cookie;

class AuthCookie
{
    public const CLIENT = 'prime_client_token';

    public const ADMIN = 'prime_admin_token';

    public const SHIPPER = 'prime_shipper_token';

    public static function attach(JsonResponse $response, string $cookieName, string $token): JsonResponse
    {
        $minutes = AuthToken::TTL_HOURS * 60;
        $secure = (bool) (config('session.secure') ?? false);
        $sameSite = config('session.same_site') ?? 'lax';

        $response->headers->setCookie(
            Cookie::create($cookieName, $token, now()->addMinutes($minutes))
                ->withHttpOnly(true)
                ->withSecure($secure)
                ->withSameSite($sameSite)
                ->withPath('/')
        );

        return $response;
    }

    public static function clear(JsonResponse $response, string $cookieName): JsonResponse
    {
        $response->headers->clearCookie(
            $cookieName,
            '/',
            null,
            (bool) (config('session.secure') ?? false),
            true,
            config('session.same_site') ?? 'lax'
        );

        return $response;
    }

    public static function clearAll(JsonResponse $response): JsonResponse
    {
        foreach ([self::CLIENT, self::ADMIN, self::SHIPPER] as $name) {
            self::clear($response, $name);
        }

        return $response;
    }
}
