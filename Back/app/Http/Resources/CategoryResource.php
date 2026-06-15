<?php

namespace App\Http\Resources;

use App\Support\StorageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
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
        $imageUrl = StorageUrl::public($this->image);

        $base = [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $imageUrl,
            'sort_order' => $this->sort_order,
            'products_count' => $this->when(isset($this->products_count), $this->products_count),
        ];

        if ($this->detailed) {
            $base['seo_title'] = $this->seo_title;
            $base['seo_description'] = $this->seo_description;
        }

        return $base;
    }
}
