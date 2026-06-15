<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ClientIndexRequest;
use App\Http\Resources\Admin\ClientDetailResource;
use App\Http\Resources\Admin\ClientResource;
use App\Models\Client;
use Illuminate\Http\JsonResponse;

class ClientController extends Controller
{
    public function index(ClientIndexRequest $request): JsonResponse
    {
        $clients = Client::query()
            ->where('role', 'client')
            ->when($request->filled('search'), fn ($q) => $q->where(function ($q) use ($request) {
                $s = $request->search;
                $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%");
            }))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json([
            'data' => ClientResource::collection($clients->getCollection()),
            'meta' => [
                'current_page' => $clients->currentPage(),
                'last_page' => $clients->lastPage(),
                'total' => $clients->total(),
            ],
        ]);
    }

    public function show(Client $client): JsonResponse
    {
        if (! in_array($client->role, ['client', 'retailer'], true)) {
            abort(404);
        }

        $client->load([
            'orders' => fn ($q) => $q->with('items')->orderByDesc('created_at'),
        ]);

        return response()->json(['data' => new ClientDetailResource($client)]);
    }

    public function destroy(Client $client): JsonResponse
    {
        if ($client->role !== 'client') {
            abort(404);
        }

        $client->delete();

        return response()->json(null, 204);
    }
}
