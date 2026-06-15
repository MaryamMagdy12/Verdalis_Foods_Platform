<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RetailerIndexRequest;
use App\Http\Resources\Admin\RetailerResource;
use App\Models\Retailer;
use Illuminate\Http\JsonResponse;

class RetailerController extends Controller
{
    public function index(RetailerIndexRequest $request): JsonResponse
    {
        $query = Retailer::query();

        if ($request->filled('status')) {
            $query->where('retailer_status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('company_name', 'like', "%{$s}%");
            });
        }

        $retailers = $query->orderByDesc('created_at')->paginate(25);

        return response()->json([
            'data' => RetailerResource::collection($retailers->getCollection()),
            'meta' => [
                'current_page' => (int) $retailers->currentPage(),
                'last_page' => $retailers->lastPage(),
                'total' => $retailers->total(),
            ],
        ]);
    }

    public function approve(Retailer $retailer): JsonResponse
    {
        $retailer->update(['retailer_status' => 'approved']);

        return response()->json(['data' => new RetailerResource($retailer)]);
    }

    public function reject(Retailer $retailer): JsonResponse
    {
        $retailer->update(['retailer_status' => 'rejected']);

        return response()->json(['data' => new RetailerResource($retailer)]);
    }

    public function destroy(Retailer $retailer): JsonResponse
    {
        $retailer->delete();

        return response()->json(null, 204);
    }
}
