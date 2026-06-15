<?php

namespace App\Support;

use Illuminate\Support\Facades\Hash;

class ShipperPin
{
    public static function isHashed(?string $stored): bool
    {
        if ($stored === null || $stored === '') {
            return false;
        }

        return str_starts_with($stored, '$2y$') || str_starts_with($stored, '$2a$');
    }

    public static function matches(?string $stored, string $pin): bool
    {
        if ($stored === null || $stored === '') {
            return false;
        }

        if (self::isHashed($stored)) {
            return Hash::check($pin, $stored);
        }

        return hash_equals($stored, $pin);
    }

    /** Plaintext value for admin display; hashed legacy values cannot be recovered. */
    public static function forAdminDisplay(?string $stored): ?string
    {
        if ($stored === null || $stored === '' || self::isHashed($stored)) {
            return null;
        }

        return $stored;
    }
}
