<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\ProductIndexRequest;
use App\Http\Requests\Catalog\ProductLimitRequest;
use App\Http\Requests\Catalog\ProductLookupRequest;
use App\Http\Resources\HomeCatalogCardResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Services\CatalogCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function index(ProductIndexRequest $request): JsonResponse
    {
        $params = $request->only(['category_id', 'featured', 'search', 'per_page', 'page']);
        $cacheKey = CatalogCache::productsKey($params);

        $payload = Cache::remember($cacheKey, CatalogCache::TTL, function () use ($request) {
            $query = Product::query()->with('category')->where('is_active', true);

            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }
            if ($request->filled('featured')) {
                $query->where('featured', true);
            }
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            }

            $perPage = min((int) $request->get('per_page', 24), 60);
            $products = $query->orderBy('name')->paginate($perPage);

            return [
                'data' => $products->getCollection()
                    ->map(fn ($p) => (new ProductResource($p))->toArray($request))
                    ->values()
                    ->all(),
                'meta' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'total' => $products->total(),
                ],
            ];
        });

        return response()->json($payload);
    }

    public function lookup(ProductLookupRequest $request): JsonResponse
    {
        $term = trim($request->validated('q'));
        $product = Product::with('category')
            ->where('is_active', true)
            ->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('sku', 'like', "%{$term}%");
            })
            ->orderBy('name')
            ->first();

        if (! $product) {
            return response()->json([
                'found' => false,
                'message' => "We don't have a product matching \"{$term}\" in our catalog right now.",
            ]);
        }

        return response()->json([
            'found' => true,
            'data' => (new ProductResource($product))->detailed()->toArray($request),
        ]);
    }

    public function highlighted(ProductLimitRequest $request): JsonResponse
    {
        $count = $request->limit(8, 20);
        $cacheKey = 'catalog.products.highlighted.' . $count;

        $payload = Cache::remember($cacheKey, CatalogCache::TTL, function () use ($count) {
            $products = Product::with('category')
                ->where('is_active', true)
                ->where(function ($q) {
                    $q->where('highlighted', true)->orWhere('featured', true);
                })
                ->orderBy('name')
                ->limit($count)
                ->get();

            return [
                'data' => ProductResource::collection($products),
            ];
        });

        return response()->json($payload);
    }

    public function random(ProductLimitRequest $request): JsonResponse
    {
        $count = $request->limit(6, 20);
        $cacheKey = 'catalog.products.random.' . $count;

        $payload = Cache::remember($cacheKey, CatalogCache::TTL, function () use ($count) {
            $products = Product::with('category')
                ->where('is_active', true)
                ->inRandomOrder()
                ->limit($count)
                ->get();

            return [
                'data' => ProductResource::collection($products),
            ];
        });

        return response()->json($payload);
    }

    public function homeCatalog(ProductLimitRequest $request): JsonResponse
    {
        $limit = min(max($request->limit(8, 12), 1), 12);

        $categories = Category::query()
            ->where('is_active', true)
            ->whereHas('products', fn ($q) => $q->where('is_active', true))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->limit($limit)
            ->get();

        $cards = $categories->map(function (Category $category) {
            $product = Product::query()
                ->where('category_id', $category->id)
                ->where('is_active', true)
                ->orderByDesc('featured')
                ->orderByDesc('highlighted')
                ->orderBy('name')
                ->first();

            return HomeCatalogCardResource::fromCategoryProduct($category, $product);
        })->filter(fn ($c) => $c['image'] || $c['product_id'])->values();

        return response()->json(['data' => $cards]);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load('category');
        $related = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->limit(4)
            ->get();

        return response()->json([
            'data' => (new ProductResource($product))->detailed(),
            'related' => ProductResource::collection($related),
        ]);
    }
}
