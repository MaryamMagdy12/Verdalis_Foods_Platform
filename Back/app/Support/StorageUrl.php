<?php

namespace App\Support;

class StorageUrl
{
    public static function public(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $base = rtrim((string) config('filesystems.disks.public.url'), '/');

        return $base.'/'.ltrim($path, '/');
    }

    /** @param  array<int, string>|null  $paths */
    public static function publicMany(?array $paths): array
    {
        if (! $paths) {
            return [];
        }

        return array_values(array_filter(array_map(
            fn ($path) => self::public($path),
            $paths
        )));
    }
}
