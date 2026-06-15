<?php

namespace App\Http\Resources;

use App\Support\StorageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HomeCatalogCardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['id'],
            'category_id' => $this->resource['category_id'],
            'slug' => $this->resource['slug'],
            'title' => $this->resource['title'],
            'subtitle' => $this->resource['subtitle'],
            'image' => $this->resource['image'],
            'product_id' => $this->resource['product_id'],
        ];
    }

    public static function fromCategoryProduct($category, $product): array
    {
        $image = StorageUrl::public($category->image);

        if (! $image && $product?->image) {
            $image = StorageUrl::public($product->image);
        }

        return [
            'id' => $category->id,
            'category_id' => $category->id,
            'slug' => $category->slug,
            'title' => $category->name,
            'subtitle' => $category->description ?? $product?->description,
            'image' => $image,
            'product_id' => $product?->id,
        ];
    }
}
