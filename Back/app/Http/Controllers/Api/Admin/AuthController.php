<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LoginRequest;
use App\Http\Resources\Admin\AdminUserResource;
use App\Models\User;
use App\Services\AuditLogService;
use App\Support\AuthCookie;
use App\Support\AuthToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private AuditLogService $audit) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, $user->password)) {
            $this->audit->log('login_failed', null, null, null, ['portal' => 'admin', 'email' => $request->email]);
            throw ValidationException::withMessages(['email' => ['The provided credentials are incorrect.']]);
        }
        if (! $user->is_admin) {
            throw ValidationException::withMessages(['email' => ['Unauthorized.']]);
        }

        $token = AuthToken::create($user, 'admin');
        $this->audit->log('login_success', $user, User::class, $user->id, ['portal' => 'admin']);

        $response = response()->json([
            'authenticated' => true,
            'expires_in_hours' => AuthToken::TTL_HOURS,
            'user' => new AdminUserResource($user),
        ]);

        return AuthCookie::attach($response, AuthCookie::ADMIN, $token);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        $response = response()->json(['message' => 'Logged out.']);

        return AuthCookie::clear($response, AuthCookie::ADMIN);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user?->is_admin) {
            abort(403);
        }

        return response()->json(['data' => new AdminUserResource($user)]);
    }
}
