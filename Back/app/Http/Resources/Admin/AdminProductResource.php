<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\CategoryResource;
use App\Support\StorageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProductResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'description' => $this->description,
            'sku' => $this->sku,
            'image' => $this->image,
            'image_url' => StorageUrl::public($this->image),
            'images' => $this->images,
            'price' => (float) $this->price,
            'wholesale_price' => $this->wholesale_price ? (float) $this->wholesale_price : null,
            'stock' => (int) $this->stock,
            'initial_stock' => (int) ($this->initial_stock ?? $this->stock ?? 0),
            'min_quantity' => (int) $this->min_quantity,
            'wholesale_min_quantity' => (int) $this->wholesale_min_quantity,
            'weight' => $this->weight,
            'size' => $this->size,
            'badges' => $this->badges ?? [],
            'discount_percent' => $this->discount_percent ? (float) $this->discount_percent : null,
            'highlighted' => (bool) $this->highlighted,
            'featured' => (bool) $this->featured,
            'is_active' => (bool) $this->is_active,
            'category' => $this->whenLoaded('category', fn () => (new CategoryResource($this->category))->toArray($request)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
