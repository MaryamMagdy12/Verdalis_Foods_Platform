<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'description', 'sku', 'image', 'images', 'highlighted', 'featured',
        'price', 'wholesale_price', 'stock', 'initial_stock', 'min_quantity', 'wholesale_min_quantity',
        'weight', 'size', 'badges', 'discount_percent', 'is_active',
    ];

    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            if ($product->initial_stock === null && $product->stock !== null) {
                $product->initial_stock = $product->stock;
            }
        });

        static::updating(function (Product $product) {
            if ($product->isDirty('stock') && $product->stock !== null) {
                $newStock = (int) $product->stock;
                $initial = (int) ($product->initial_stock ?? 0);
                if ($newStock > $initial) {
                    $product->initial_stock = $newStock;
                }
            }
        });
    }

    protected function casts(): array
    {
        return [
            'highlighted' => 'boolean',
            'featured' => 'boolean',
            'is_active' => 'boolean',
            'images' => 'array',
            'badges' => 'array',
            'price' => 'decimal:2',
            'wholesale_price' => 'decimal:2',
            'discount_percent' => 'decimal:2',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    public function priceForUser(?Client $client): float
    {
        if ($client && $client->isRetailer() && $this->wholesale_price) {
            return (float) $this->wholesale_price;
        }

        $base = (float) $this->price;
        if ($this->discount_percent) {
            return round($base * (1 - $this->discount_percent / 100), 2);
        }

        return $base;
    }
}
