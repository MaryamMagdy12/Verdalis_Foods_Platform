<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CatalogCache
{
    public const TTL = 3600; // 1 hour

    public static function categoriesKey(?string $suffix = null): string
    {
        return 'catalog.categories' . ($suffix ? ".{$suffix}" : '');
    }

    public static function productsKey(array $params = []): string
    {
        ksort($params);

        return 'catalog.products.' . md5(json_encode($params));
    }

    public static function forgetCategories(): void
    {
        foreach (['', 'list', 'counts', 'admin'] as $suffix) {
            Cache::forget(self::categoriesKey($suffix ?: null));
        }
    }

    public static function adminProductsKey(array $params = []): string
    {
        ksort($params);

        return 'catalog.admin.products.' . md5(json_encode($params));
    }

    public static function forgetProducts(): void
    {
        if (method_exists(Cache::getStore(), 'tags')) {
            try {
                Cache::tags(['catalog', 'products'])->flush();
            } catch (\Throwable) {
                Cache::flush();
            }
        }

        // Clear common list cache key patterns
        foreach (range(4, 20) as $limit) {
            Cache::forget('catalog.products.highlighted.'.$limit);
            Cache::forget('catalog.products.random.'.$limit);
        }
    }

    public static function forgetAll(): void
    {
        self::forgetCategories();
        self::forgetProducts();
    }
}
