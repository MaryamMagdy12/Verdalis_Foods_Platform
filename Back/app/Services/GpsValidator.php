<?php

namespace App\Services;

use App\Models\Order;
use InvalidArgumentException;

class GpsValidator
{
    public const MIN_ACCURACY_METERS = 200;

    public function validate(float $latitude, float $longitude, ?float $accuracy = null): void
    {
        if ($latitude === 0.0 && $longitude === 0.0) {
            throw new InvalidArgumentException('Valid GPS coordinates are required.');
        }

        if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
            throw new InvalidArgumentException('GPS coordinates are out of range.');
        }

        if ($accuracy !== null && $accuracy > self::MIN_ACCURACY_METERS) {
            throw new InvalidArgumentException('GPS accuracy is too low. Move to an open area and try again.');
        }
    }

    public function distanceMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return 2 * $earthRadius * asin(min(1, sqrt($a)));
    }

    public function assertWithinDeliveryRadius(Order $order, float $lat, float $lng, int $maxMeters = 500): void
    {
        $address = $order->shipping_address;
        if (! is_array($address)) {
            return;
        }

        $destLat = $address['latitude'] ?? $address['lat'] ?? null;
        $destLng = $address['longitude'] ?? $address['lng'] ?? null;

        if ($destLat === null || $destLng === null) {
            return;
        }

        $distance = $this->distanceMeters($lat, $lng, (float) $destLat, (float) $destLng);
        if ($distance > $maxMeters) {
            throw new InvalidArgumentException('You are too far from the delivery address ('.round($distance).'m away).');
        }
    }
}
