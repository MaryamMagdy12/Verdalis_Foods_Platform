<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Services\NominatimGeocoder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StoreController extends Controller
{
    public function __construct(
        private NominatimGeocoder $geocoder
    ) {}

    public function index(): JsonResponse
    {
        $stores = Store::orderBy('name')->get();
        return response()->json(['data' => $stores]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ], [
            'name.required' => 'Please enter the store name.',
            'address.required' => 'Please enter the store address.',
        ])->validate();

        $latitude = $validated['latitude'] ?? null;
        $longitude = $validated['longitude'] ?? null;

        if ($latitude === null || $longitude === null) {
            $coords = $this->geocoder->geocode($validated['address']);
            if ($coords !== null) {
                $latitude = $coords['latitude'];
                $longitude = $coords['longitude'];
            }
        }

        $store = Store::create([
            'name' => $validated['name'],
            'address' => $validated['address'],
            'latitude' => $latitude,
            'longitude' => $longitude,
        ]);

        return response()->json(['data' => $store], 201);
    }

    public function show(Store $store): JsonResponse
    {
        return response()->json(['data' => $store]);
    }

    public function update(Request $request, Store $store): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'address' => 'sometimes|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ], [
            'name.required' => 'Please enter the store name.',
            'address.required' => 'Please enter the store address.',
        ])->validate();

        $latitude = array_key_exists('latitude', $validated) ? $validated['latitude'] : $store->latitude;
        $longitude = array_key_exists('longitude', $validated) ? $validated['longitude'] : $store->longitude;

        $address = $validated['address'] ?? $store->address;
        if (($latitude === null || $longitude === null) && $address !== '') {
            $coords = $this->geocoder->geocode($address);
            if ($coords !== null) {
                $latitude = $coords['latitude'];
                $longitude = $coords['longitude'];
            }
        }

        $store->update(array_merge($validated, [
            'latitude' => $latitude,
            'longitude' => $longitude,
        ]));

        return response()->json(['data' => $store]);
    }

    public function destroy(Store $store): JsonResponse
    {
        $store->delete();
        return response()->json(null, 204);
    }
}
