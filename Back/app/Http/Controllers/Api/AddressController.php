<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Address\StoreAddressRequest;
use App\Http\Requests\Address\UpdateAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->orderByDesc('is_default')->get();

        return response()->json(['data' => AddressResource::collection($addresses)]);
    }

    public function store(StoreAddressRequest $request): JsonResponse
    {
        if ($request->boolean('is_default')) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address = $request->user()->addresses()->create($request->validated());

        return response()->json(['data' => new AddressResource($address)], 201);
    }

    public function update(UpdateAddressRequest $request, Address $address): JsonResponse
    {
        if ($address->client_id !== $request->user()->id) {
            abort(403);
        }

        if ($request->boolean('is_default')) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($request->validated());

        return response()->json(['data' => new AddressResource($address)]);
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        if ($address->client_id !== $request->user()->id) {
            abort(403);
        }
        $address->delete();

        return response()->json(['message' => 'Address deleted.']);
    }
}
