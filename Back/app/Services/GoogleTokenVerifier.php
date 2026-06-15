<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class GoogleTokenVerifier
{
    public function verify(string $idToken): array
    {
        $clientId = config('services.google.client_id');
        if (! $clientId && app()->environment('production')) {
            throw ValidationException::withMessages(['credential' => ['Google Sign-In is not configured.']]);
        }

        $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $idToken,
        ]);

        if (! $response->ok()) {
            throw ValidationException::withMessages(['credential' => ['Invalid Google token.']]);
        }

        $data = $response->json();
        if ($clientId && ($data['aud'] ?? null) !== $clientId) {
            throw ValidationException::withMessages(['credential' => ['Google token audience mismatch.']]);
        }

        if (empty($data['email'])) {
            throw ValidationException::withMessages(['credential' => ['Google account has no email.']]);
        }

        return $data;
    }
}
