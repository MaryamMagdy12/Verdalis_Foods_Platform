<?php

namespace App\Http\Resources;

use App\Support\StorageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function __construct($resource, protected bool $detailed = false)
    {
        parent::__construct($resource);
    }

    public function detailed(bool $value = true): static
    {
        $this->detailed = $value;

        return $this;
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $images = [];
        if ($this->image) {
            $images[] = StorageUrl::public($this->image);
        }
        if ($this->images) {
            foreach ($this->images as $img) {
                $images[] = StorageUrl::public($img);
            }
        }

        $base = [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'sku' => $this->sku,
            'image' => $images[0] ?? null,
            'images' => $images,
            'price' => (float) $this->price,
            'wholesale_price' => $this->wholesale_price ? (float) $this->wholesale_price : null,
            'stock' => (int) $this->stock,
            'min_quantity' => (int) $this->min_quantity,
            'wholesale_min_quantity' => (int) $this->wholesale_min_quantity,
            'weight' => $this->weight,
            'size' => $this->size,
            'badges' => $this->badges ?? [],
            'discount_percent' => $this->discount_percent ? (float) $this->discount_percent : null,
            'highlighted' => (bool) $this->highlighted,
            'featured' => (bool) $this->featured,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
        ];

        if ($this->detailed) {
            $base['in_stock'] = $this->stock > 0;
        }

        return $base;
    }
}
