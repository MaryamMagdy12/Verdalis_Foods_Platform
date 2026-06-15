<?php

namespace App\Http\Middleware;

use App\Models\Client;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApprovedRetailer
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof Client || ! $user->isRetailer()) {
            return response()->json(['message' => 'Approved retailer account required.'], 403);
        }

        return $next($request);
    }
}
