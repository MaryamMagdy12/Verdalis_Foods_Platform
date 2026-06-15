<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Services\NominatimGeocoder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function __construct(
        private NominatimGeocoder $geocoder
    ) {}

    /**
     * List stores. Optional: pass ?location= or ?q= with an address or postal code
     * to get stores sorted by distance (nearest first). Use ?radius_km=50 to only
     * return stores within that many km (filter). Response includes distance_km
     * per store when a location search is used.
     */
    public function index(Request $request): JsonResponse
    {
        $location = $request->query('location') ?? $request->query('q');
        $location = is_string($location) ? trim($location) : '';
        $radiusKm = $request->query('radius_km');
        $radiusKm = is_numeric($radiusKm) && (float) $radiusKm > 0 ? (float) $radiusKm : null;

        if ($location === '') {
            $stores = Store::orderBy('name')->get();
            return response()->json([
                'data' => $stores->map(fn ($s) => $this->storeToArray($s)),
            ]);
        }

        $coords = $this->geocoder->geocode($location);
        if ($coords === null) {
            $stores = Store::orderBy('name')->get();
            return response()->json([
                'data' => $stores->map(fn ($s) => $this->storeToArray($s)),
                'message' => 'Location could not be resolved; showing all stores.',
            ]);
        }

        $userLat = $coords['latitude'];
        $userLon = $coords['longitude'];

        $stores = Store::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        $withDistance = $stores->map(function ($s) use ($userLat, $userLon) {
            $lat = (float) $s->latitude;
            $lon = (float) $s->longitude;
            $km = $this->haversineDistanceKm($userLat, $userLon, $lat, $lon);
            return [
                'store' => $s,
                'distance_km' => round($km, 2),
            ];
        })
            ->sortBy('distance_km')
            ->values();

        if ($radiusKm !== null) {
            $withDistance = $withDistance->filter(fn ($item) => $item['distance_km'] <= $radiusKm)->values();
        }

        return response()->json([
            'data' => $withDistance->map(fn ($item) => array_merge(
                $this->storeToArray($item['store']),
                ['distance_km' => $item['distance_km']]
            )),
            'search_location' => [
                'latitude' => $userLat,
                'longitude' => $userLon,
            ],
        ]);
    }

    private function storeToArray(Store $s): array
    {
        return [
            'id' => $s->id,
            'name' => $s->name,
            'address' => $s->address,
            'latitude' => $s->latitude !== null ? (float) $s->latitude : null,
            'longitude' => $s->longitude !== null ? (float) $s->longitude : null,
        ];
    }

    private function haversineDistanceKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $R = 6371; // Earth radius in km
        $phi1 = deg2rad($lat1);
        $phi2 = deg2rad($lat2);
        $deltaPhi = deg2rad($lat2 - $lat1);
        $deltaLambda = deg2rad($lon2 - $lon1);
        $a = sin($deltaPhi / 2) ** 2 + cos($phi1) * cos($phi2) * sin($deltaLambda / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $R * $c;
    }
}
