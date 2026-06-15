<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function warehouse(): JsonResponse
    {
        $address = Setting::getValue('warehouse_address', '');
        $lat = Setting::getValue('warehouse_lat', '');
        $lng = Setting::getValue('warehouse_lng', '');
        return response()->json([
            'data' => [
                'address' => $address,
                'latitude' => $lat ? (float) $lat : null,
                'longitude' => $lng ? (float) $lng : null,
            ],
        ]);
    }
}
