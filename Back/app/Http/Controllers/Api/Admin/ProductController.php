<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\Admin\AdminProductResource;
use App\Models\Product;
use App\Services\CatalogCache;
use App\Services\ProductImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function __construct(private ProductImageService $images) {}

    public function index(Request $request): JsonResponse
    {
        $params = $request->only(['category_id']);
        $cacheKey = CatalogCache::adminProductsKey($params);

        $payload = Cache::remember($cacheKey, CatalogCache::TTL, function () use ($request) {
            $query = Product::with('category');
            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            return [
                'data' => AdminProductResource::collection($query->orderBy('name')->get()),
            ];
        });

        return response()->json($payload);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $this->images->storeUpload($request, $data);
        $product = Product::create($data);
        $product->load('category');
        CatalogCache::forgetAll();

        return response()->json(['data' => new AdminProductResource($product)], 201);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load('category');

        return response()->json(['data' => new AdminProductResource($product)]);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();
        $this->images->storeUpload($request, $data, $product);
        $product->update($data);
        $product->load('category');
        CatalogCache::forgetAll();

        return response()->json(['data' => new AdminProductResource($product)]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->images->delete($product);
        $product->delete();
        CatalogCache::forgetAll();

        return response()->json(null, 204);
    }
}
