<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class NominatimGeocoder
{
    private const BASE_URL = 'https://nominatim.openstreetmap.org/search';

    private ?string $lastError = null;

    /**
     * Get latitude and longitude for an address using OpenStreetMap Nominatim.
     * Respects 1 request per second usage policy.
     *
     * @return array{latitude: float, longitude: float}|null
     */
    public function geocode(string $address): ?array
    {
        $this->lastError = null;
        $address = trim($address);
        if ($address === '') {
            $this->lastError = 'Address is empty';
            return null;
        }

        $address = $this->ensurePostalHasCountry($address);
        $normalized = $this->normalizeAddress($address);
        $data = $this->fetchFromNominatim($normalized, true);
        if (! is_array($data) || empty($data)) {
            $data = $this->geocodeWithoutCountryFilter($normalized);
        }
        if (! is_array($data) || empty($data)) {
            $data = $this->tryPostalCodeOnly($address);
        }
        if (! is_array($data) || empty($data)) {
            $this->lastError = 'No results for this address (try adding country, e.g. Canada or United States)';
            return null;
        }

        $first = $data[0];
        $lat = $first['lat'] ?? null;
        $lon = $first['lon'] ?? null;

        if ($lat === null || $lon === null || ! is_numeric($lat) || ! is_numeric($lon)) {
            $this->lastError = 'Nominatim returned invalid coordinates';
            return null;
        }

        return [
            'latitude' => (float) $lat,
            'longitude' => (float) $lon,
        ];
    }

    /**
     * When user enters only a postal code (e.g. "S4T 0X4" or "60452"), append country
     * so the first geocode request succeeds for postal-only search.
     */
    private function ensurePostalHasCountry(string $address): string
    {
        $trimmed = trim($address);
        if ($trimmed === '') {
            return $address;
        }
        $canadianPostal = '/^([A-Za-z]\d[A-Za-z])\s*(\d[A-Za-z]\d)$/';
        $usZip = '/^(\d{5})(-\d{4})?$/';
        if (preg_match($canadianPostal, $trimmed)) {
            return $trimmed . ' Canada';
        }
        if (preg_match($usZip, $trimmed)) {
            return $trimmed . ' United States';
        }
        return $address;
    }

    private function normalizeAddress(string $address): string
    {
        $a = $address;
        $a = preg_replace('/\bil\b/i', 'IL', $a);
        $a = preg_replace('/\bOn\b/', 'ON', $a);
        $a = preg_replace('/\bSk\b/', 'SK', $a);
        $hasCanada = preg_match('/\bCanada\b/i', $a);
        $hasUS = preg_match('/\b(United States|USA|U\.?S\.?A\.?)\b/i', $a);
        $canadianProvinces = '/\b(ON|QC|BC|AB|SK|MB|NS|NB|NL|PE|NT|YT)\b/i';
        $usStates = '/\b(IL|CA|NY|TX|FL|OH|MI|PA|AZ|WA)\b/i';
        if (! $hasCanada && preg_match($canadianProvinces, $a)) {
            $a = trim($a) . ' Canada';
        }
        if (! $hasUS && preg_match($usStates, $a)) {
            $a = trim($a) . ' United States';
        }
        return $a;
    }

    private function fetchFromNominatim(string $query, bool $withCountryFilter): array
    {
        $params = [
            'q' => $query,
            'format' => 'json',
            'limit' => 1,
        ];
        if ($withCountryFilter) {
            $params['countrycodes'] = 'ca,us';
        }
        $response = Http::withHeaders([
            'User-Agent' => config('services.nominatim.user_agent', 'VerdalisFoodsSiteCatalog/1.0'),
        ])->get(self::BASE_URL, $params);
        if (! $response->successful()) {
            $this->lastError = 'Nominatim HTTP ' . $response->status();
            return [];
        }
        $data = $response->json();
        return is_array($data) ? $data : [];
    }

    /**
     * Retry without country filter; only return data if result is in CA/US (by bounding box).
     */
    private function geocodeWithoutCountryFilter(string $address): array
    {
        sleep(1);
        $data = $this->fetchFromNominatim($address, false);
        if (empty($data)) {
            return [];
        }
        $first = $data[0];
        $lat = isset($first['lat']) && is_numeric($first['lat']) ? (float) $first['lat'] : null;
        $lon = isset($first['lon']) && is_numeric($first['lon']) ? (float) $first['lon'] : null;
        if ($lat === null || $lon === null) {
            return [];
        }
        if ($lat < 24 || $lat > 72 || $lon < -170 || $lon > -50) {
            return [];
        }
        return $data;
    }

    private function tryPostalCodeOnly(string $address): array
    {
        if (preg_match('/\b([A-Za-z]\d[A-Za-z])\s*(\d[A-Za-z]\d)\b/', $address, $m)) {
            $postal = strtoupper($m[1]) . ' ' . strtoupper($m[2]);
            $country = preg_match('/\b(United States|USA)\b/i', $address) ? 'United States' : 'Canada';
            sleep(1);
            $data = $this->fetchFromNominatim($postal . ' ' . $country, false);
            if (! empty($data)) {
                $first = $data[0];
                $lat = isset($first['lat']) && is_numeric($first['lat']) ? (float) $first['lat'] : null;
                $lon = isset($first['lon']) && is_numeric($first['lon']) ? (float) $first['lon'] : null;
                if ($lat !== null && $lon !== null && $lat >= 24 && $lat <= 72 && $lon >= -170 && $lon <= -50) {
                    return $data;
                }
            }
        }
        if (preg_match('/\b(\d{5})(-\d{4})?\b/', $address, $m)) {
            $zip = $m[1];
            sleep(1);
            $data = $this->fetchFromNominatim($zip . ' United States', false);
            if (! empty($data)) {
                $first = $data[0];
                $lat = isset($first['lat']) && is_numeric($first['lat']) ? (float) $first['lat'] : null;
                $lon = isset($first['lon']) && is_numeric($first['lon']) ? (float) $first['lon'] : null;
                if ($lat !== null && $lon !== null && $lat >= 24 && $lat <= 72 && $lon >= -170 && $lon <= -50) {
                    return $data;
                }
            }
        }
        return [];
    }

    public function getLastError(): ?string
    {
        return $this->lastError;
    }
}
