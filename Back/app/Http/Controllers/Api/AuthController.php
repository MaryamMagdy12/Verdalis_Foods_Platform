<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\GoogleAuthRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ShipperLoginRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Models\Client;
use App\Models\EmailOtp;
use App\Models\Retailer;
use App\Models\Shipper;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\GoogleTokenVerifier;
use App\Services\OtpService;
use App\Support\AuthCookie;
use App\Support\ShipperPin;
use App\Support\AuthToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private OtpService $otp,
        private GoogleTokenVerifier $google,
        private AuditLogService $audit,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $role = $data['role'] ?? 'client';
        $data['role'] = $role;

        $otpPayload = $data;
        $otpPayload['password_hash'] = Hash::make($data['password']);
        unset($otpPayload['password']);

        try {
            $this->otp->send($data['email'], 'register', $otpPayload);
        } catch (\Throwable) {
            throw ValidationException::withMessages([
                'email' => ['We could not send the verification email. Please try again in a moment.'],
            ]);
        }

        return response()->json([
            'message' => 'Verification code sent to your email.',
            'email' => $data['email'],
            'otp_required' => true,
        ]);
    }

    public function resendOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'purpose' => 'required|in:register,login,password_reset',
        ]);

        $email = $data['email'];
        $purpose = $data['purpose'];

        try {
            if ($purpose === 'login') {
                $user = Client::withoutGlobalScopes()->where('email', $email)->first();
                if (! $user) {
                    throw ValidationException::withMessages(['email' => ['Account not found.']]);
                }
                $this->otp->send($email, 'login', ['client_id' => $user->id]);
            } elseif ($purpose === 'password_reset') {
                $user = Client::withoutGlobalScopes()->where('email', $email)->first();
                if ($user) {
                    $this->otp->send($email, 'password_reset', ['client_id' => $user->id]);
                }
            } elseif (! $this->otp->resend($email, 'register')) {
                throw ValidationException::withMessages(['email' => ['No pending registration found. Please sign up again.']]);
            }
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable) {
            throw ValidationException::withMessages([
                'email' => ['We could not send the verification email. Please try again in a moment.'],
            ]);
        }

        return response()->json(['message' => 'Verification code sent to your email.']);
    }

    public function registerVerify(VerifyOtpRequest $request): JsonResponse
    {
        $otp = $this->otp->verify($request->email, 'register', $request->code);
        if (! $otp || empty($otp->payload)) {
            throw ValidationException::withMessages(['code' => ['Invalid or expired verification code.']]);
        }

        $data = $otp->payload;
        $role = $data['role'] ?? 'client';
        if (! empty($data['password_hash'])) {
            $data['password'] = $data['password_hash'];
        }

        $user = $role === 'retailer'
            ? Retailer::create($this->retailerAttributes($data))
            : Client::create($this->clientAttributes($data));

        $user->forceFill(['email_verified_at' => now()])->save();

        $this->audit->log('register_success', $user, Client::class, $user->id);

        return $this->clientAuthResponse($user, 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $email = $request->email;

        $user = Client::withoutGlobalScopes()->where('email', $email)->first();

        if (! $user) {
            if (EmailOtp::where('email', $email)->where('purpose', 'register')->where('expires_at', '>', now())->exists()) {
                throw ValidationException::withMessages([
                    'email' => ['Registration is not complete. Finish sign-up with your verification code, or register again to receive a new one.'],
                ]);
            }

            if (User::where('email', $email)->where('is_admin', true)->exists()) {
                throw ValidationException::withMessages(['email' => ['Use the admin portal to sign in.']]);
            }

            if (Shipper::where('email', $email)->exists()) {
                throw ValidationException::withMessages(['email' => ['Use the shipper app to sign in.']]);
            }

            $this->audit->log('login_failed', null, null, null, ['email' => $email]);

            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        if (! $user->password || ! Hash::check($request->password, $user->password)) {
            $this->audit->log('login_failed', null, null, null, ['email' => $email]);
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        try {
            $this->otp->send($user->email, 'login', ['client_id' => $user->id]);
        } catch (\Throwable) {
            throw ValidationException::withMessages([
                'email' => ['We could not send the verification email. Please try again in a moment.'],
            ]);
        }

        return response()->json([
            'message' => 'Verification code sent to your email.',
            'email' => $user->email,
            'otp_required' => true,
        ]);
    }

    public function loginVerify(VerifyOtpRequest $request): JsonResponse
    {
        $otp = $this->otp->verify($request->email, 'login', $request->code);
        if (! $otp) {
            throw ValidationException::withMessages(['code' => ['Invalid or expired verification code.']]);
        }

        $clientId = $otp->payload['client_id'] ?? $otp->payload['user_id'] ?? null;
        $user = $clientId
            ? Client::withoutGlobalScopes()->find($clientId)
            : Client::withoutGlobalScopes()->where('email', $request->email)->first();

        if (! $user) {
            throw ValidationException::withMessages(['email' => ['Account not found.']]);
        }

        $this->audit->log('login_success', $user, Client::class, $user->id);

        return $this->clientAuthResponse($user);
    }

    public function google(GoogleAuthRequest $request): JsonResponse
    {
        $googleUser = $this->google->verify($request->credential);
        $email = $googleUser['email'];
        $googleId = $googleUser['sub'] ?? null;

        $user = Client::withoutGlobalScopes()
            ->where(function ($query) use ($email, $googleId) {
                $query->where('email', $email);
                if ($googleId) {
                    $query->orWhere('google_id', $googleId);
                }
            })
            ->first();

        if (! $user) {
            if (User::where('email', $email)->where('is_admin', true)->exists()) {
                throw ValidationException::withMessages(['credential' => ['Use the admin portal to sign in.']]);
            }

            if (Shipper::where('email', $email)->exists()) {
                throw ValidationException::withMessages(['credential' => ['Use the shipper app to sign in.']]);
            }
        }

        if ($user) {
            if (! $user->google_id && $googleId) {
                $user->update(['google_id' => $googleId]);
            }
        } else {
            $user = Client::create([
                'name' => $googleUser['name'] ?? explode('@', $email)[0],
                'email' => $email,
                'password' => Str::password(32),
                'google_id' => $googleId,
                'profile_complete' => false,
                'photo' => $googleUser['picture'] ?? null,
            ]);
        }

        $user->update(['last_activity_at' => now(), 'email_verified_at' => now()]);
        $this->audit->log('login_success', $user, Client::class, $user->id, ['method' => 'google']);

        $response = $this->clientAuthResponse($user);
        $response->setData(array_merge($response->getData(true), [
            'profile_complete' => (bool) $user->profile_complete,
        ]));

        return $response;
    }

    public function shipperLogin(ShipperLoginRequest $request): JsonResponse
    {
        $user = Shipper::where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, $user->password)) {
            $this->audit->log('login_failed', null, null, null, ['portal' => 'shipper', 'email' => $request->email]);
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages(['email' => ['Shipper account is inactive.']]);
        }

        if (! ShipperPin::matches($user->shipper_pin, $request->pin)) {
            $this->audit->log('login_failed', null, null, null, ['portal' => 'shipper', 'reason' => 'invalid_pin']);
            throw ValidationException::withMessages(['pin' => ['Invalid company ID (PIN).']]);
        }

        $this->audit->log('login_success', $user, Shipper::class, $user->id);

        return $this->shipperAuthResponse($user);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user?->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        $response = response()->json(['message' => 'Logged out.']);
        AuthCookie::clearAll($response);

        return $response;
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => new UserResource($request->user())]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->email;
        $user = Client::withoutGlobalScopes()->where('email', $email)->first();

        if ($user) {
            $this->otp->send($email, 'password_reset', ['client_id' => $user->id]);
            $this->audit->log('password_reset_requested', $user, Client::class, $user->id);
        }

        return response()->json(['message' => 'If that email exists, a reset code has been sent.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $otp = $this->otp->verify($data['email'], 'password_reset', $data['code']);
        if (! $otp) {
            throw ValidationException::withMessages(['code' => ['Invalid or expired reset code.']]);
        }

        $clientId = $otp->payload['client_id'] ?? null;
        $user = $clientId
            ? Client::withoutGlobalScopes()->find($clientId)
            : Client::withoutGlobalScopes()->where('email', $data['email'])->first();

        if (! $user) {
            throw ValidationException::withMessages(['email' => ['Account not found.']]);
        }

        $user->update(['password' => $data['password']]);
        $user->tokens()->delete();

        $this->audit->log('password_reset_completed', $user, Client::class, $user->id);

        return response()->json(['message' => 'Password has been reset. You can sign in now.']);
    }

    private function clientAuthResponse(Client $user, int $status = 200): JsonResponse
    {
        $user->update(['last_activity_at' => now(), 'email_verified_at' => $user->email_verified_at ?? now()]);
        $token = AuthToken::create($user, 'client');

        $response = response()->json([
            'authenticated' => true,
            'expires_in_hours' => AuthToken::TTL_HOURS,
            'user' => new UserResource($user),
        ], $status);

        return AuthCookie::attach($response, AuthCookie::CLIENT, $token);
    }

    private function shipperAuthResponse(Shipper $user): JsonResponse
    {
        $token = AuthToken::create($user, 'shipper', ['shipper']);

        $response = response()->json([
            'authenticated' => true,
            'expires_in_hours' => AuthToken::TTL_HOURS,
            'user' => new UserResource($user),
        ]);

        return AuthCookie::attach($response, AuthCookie::SHIPPER, $token);
    }

    /** @param  array<string, mixed>  $data */
    private function clientAttributes(array $data): array
    {
        return [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password_hash'] ?? $data['password'],
            'phone' => $data['phone'],
            'address' => $data['address'],
            'location_lat' => $data['location_lat'] ?? null,
            'location_lng' => $data['location_lng'] ?? null,
            'photo' => $data['photo'] ?? null,
            'profile_complete' => true,
        ];
    }

    /** @param  array<string, mixed>  $data */
    private function retailerAttributes(array $data): array
    {
        return [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password_hash'] ?? $data['password'],
            'phone' => $data['phone'],
            'personal_address' => $data['personal_address'],
            'store_name' => $data['store_name'],
            'store_address' => $data['store_address'],
            'company_name' => $data['store_name'],
            'location_lat' => $data['location_lat'] ?? null,
            'location_lng' => $data['location_lng'] ?? null,
            'photo' => $data['photo'] ?? null,
            'retailer_status' => 'pending',
            'profile_complete' => true,
        ];
    }
}
