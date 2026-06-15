<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function getWarehouse(): JsonResponse
    {
        return response()->json([
            'data' => [
                'address' => Setting::getValue('warehouse_address', ''),
                'latitude' => Setting::getValue('warehouse_lat', ''),
                'longitude' => Setting::getValue('warehouse_lng', ''),
            ],
        ]);
    }

    public function updateWarehouse(Request $request): JsonResponse
    {
        $request->validate([
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ], [
            'address.string' => 'Address must be text.',
            'latitude.numeric' => 'Latitude must be a number.',
            'longitude.numeric' => 'Longitude must be a number.',
        ]);
        if ($request->has('address')) {
            Setting::setValue('warehouse_address', $request->address ?? '');
        }
        if ($request->has('latitude')) {
            Setting::setValue('warehouse_lat', $request->latitude ?? '');
        }
        if ($request->has('longitude')) {
            Setting::setValue('warehouse_lng', $request->longitude ?? '');
        }
        return response()->json([
            'data' => [
                'address' => Setting::getValue('warehouse_address', ''),
                'latitude' => Setting::getValue('warehouse_lat', ''),
                'longitude' => Setting::getValue('warehouse_lng', ''),
            ],
        ]);
    }
}
