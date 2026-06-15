<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\CategoryIndexRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CatalogCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index(CategoryIndexRequest $request): JsonResponse
    {
        $key = CatalogCache::categoriesKey($request->boolean('with_counts') ? 'counts' : 'list');

        $data = Cache::remember($key, CatalogCache::TTL, function () use ($request) {
            $query = Category::query()->where('is_active', true)->orderBy('sort_order')->orderBy('name');

            if ($request->boolean('with_counts')) {
                $query->withCount(['products' => fn ($q) => $q->where('is_active', true)]);
            }

            return $query->get()
                ->map(fn ($c) => (new CategoryResource($c))->toArray($request))
                ->values()
                ->all();
        });

        return response()->json(['data' => $data]);
    }

    public function show(Category $category): JsonResponse
    {
        if (! $category->is_active) {
            abort(404);
        }

        return response()->json([
            'data' => (new CategoryResource($category))->detailed(),
        ]);
    }
}
