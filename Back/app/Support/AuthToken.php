<?php

namespace App\Support;

use Carbon\CarbonInterface;
use Laravel\Sanctum\Contracts\HasApiTokens;

class AuthToken
{
    public const TTL_HOURS = 2;

    public static function expiresAt(): CarbonInterface
    {
        return now()->addHours(self::TTL_HOURS);
    }

    public static function create(HasApiTokens $user, string $name, array $abilities = ['*']): string
    {
        return $user->createToken($name, $abilities, self::expiresAt())->plainTextToken;
    }
}
