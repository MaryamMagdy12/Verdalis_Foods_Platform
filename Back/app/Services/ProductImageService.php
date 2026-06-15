<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductImageService
{
  /** @param  array<string, mixed>  $data */
  public function storeUpload(Request $request, array &$data, ?Product $existing = null): void
  {
    if (! $request->hasFile('image')) {
      return;
    }

    if ($existing?->image) {
      Storage::disk('public')->delete($existing->image);
    }

    $data['image'] = $request->file('image')->store('products', 'public');
  }

  public function delete(Product $product): void
  {
    if ($product->image) {
      Storage::disk('public')->delete($product->image);
    }
  }
}
