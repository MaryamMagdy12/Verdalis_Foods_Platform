<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CompleteProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function complete(CompleteProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $updates = array_filter([
            'name' => $data['name'] ?? $user->name,
            'phone' => $data['phone'] ?? $user->phone,
            'address' => $data['address'] ?? $user->address,
            'location_lat' => $data['location_lat'] ?? null,
            'location_lng' => $data['location_lng'] ?? null,
            'photo' => $data['photo'] ?? $user->photo,
            'profile_complete' => true,
        ], fn ($v) => $v !== null);

        if (! empty($data['password'])) {
            $updates['password'] = $data['password'];
        }

        $user->update($updates);

        if (! empty($data['shipping_address'])) {
            $user->addresses()->updateOrCreate(
                ['is_default' => true],
                array_merge($data['shipping_address'], ['label' => 'Default', 'is_default' => true])
            );
        }

        return response()->json(['data' => new UserResource($user->fresh())]);
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate(['photo' => 'required|image|max:5120']);
        $path = $request->file('photo')->store('profiles', 'public');
        $request->user()->update(['photo' => $path]);

        return response()->json([
            'photo' => $path,
            'photo_url' => asset('storage/'.$path),
        ]);
    }
}
