<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\Admin\AdminCategoryResource;
use App\Models\Category;
use App\Services\CatalogCache;
use App\Services\CategoryImageService;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function __construct(private CategoryImageService $images) {}

    public function index(): JsonResponse
    {
        $categories = Category::query()->orderBy('sort_order')->orderBy('name')->get();

        return response()->json([
            'data' => AdminCategoryResource::collection($categories),
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $this->images->storeUpload($request, $data);
        $category = Category::create($data);
        CatalogCache::forgetAll();

        return response()->json(['data' => new AdminCategoryResource($category)], 201);
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json(['data' => new AdminCategoryResource($category)]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $data = $request->validated();
        $this->images->storeUpload($request, $data, $category);
        $category->update($data);
        CatalogCache::forgetAll();

        return response()->json(['data' => new AdminCategoryResource($category->fresh())]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->images->delete($category);
        $category->delete();
        CatalogCache::forgetAll();

        return response()->json(null, 204);
    }
}
