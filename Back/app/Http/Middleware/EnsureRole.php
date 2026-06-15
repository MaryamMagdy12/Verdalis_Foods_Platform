<?php

namespace App\Http\Middleware;

use App\Models\Client;
use App\Models\Shipper;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user instanceof User && $user->is_admin && in_array('admin', $roles, true)) {
            return $next($request);
        }

        if ($user instanceof Shipper && in_array('shipper', $roles, true)) {
            if (! $user->is_active) {
                return response()->json(['message' => 'Shipper account is inactive.'], 403);
            }

            return $next($request);
        }

        if ($user instanceof Client) {
            if (in_array('client', $roles, true) && $user->role === 'client') {
                return $next($request);
            }
            if (in_array('retailer', $roles, true) && $user->role === 'retailer') {
                if ($user->retailer_status !== 'approved') {
                    return response()->json(['message' => 'Retailer account pending approval.'], 403);
                }

                return $next($request);
            }
        }

        return response()->json(['message' => 'Forbidden.'], 403);
    }
}
