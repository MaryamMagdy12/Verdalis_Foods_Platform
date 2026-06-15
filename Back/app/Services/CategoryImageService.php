<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryImageService
{
    /** @param  array<string, mixed>  $data */
    public function storeUpload(Request $request, array &$data, ?Category $existing = null): void
    {
        if (! $request->hasFile('image')) {
            return;
        }

        if ($existing?->image) {
            Storage::disk('public')->delete($existing->image);
        }

        $data['image'] = $request->file('image')->store('categories', 'public');
    }

    public function delete(Category $category): void
    {
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }
    }
}
