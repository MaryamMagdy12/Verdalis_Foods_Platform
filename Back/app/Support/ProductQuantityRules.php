<?php

namespace App\Support;

use App\Models\Client;
use App\Models\Product;

class ProductQuantityRules
{
    public static function minForUser(Product $product, ?Client $client): int
    {
        $isWholesale = $client?->isRetailer() ?? false;

        return max(1, (int) ($isWholesale ? $product->wholesale_min_quantity : $product->min_quantity));
    }

    public static function maxForProduct(Product $product): int
    {
        $available = (int) $product->stock - (int) ($product->stock_reserved ?? 0);

        return max(0, $available);
    }

    public static function clamp(int $quantity, Product $product, ?Client $client): int
    {
        $min = self::minForUser($product, $client);
        $max = self::maxForProduct($product);

        if ($max < $min) {
            return $min;
        }

        return max($min, min($max, $quantity));
    }
}