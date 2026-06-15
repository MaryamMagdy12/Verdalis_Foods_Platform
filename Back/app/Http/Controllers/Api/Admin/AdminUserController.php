<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminUserIndexRequest;
use App\Http\Requests\Admin\StoreAdminRequest;
use App\Http\Resources\Admin\AdminUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(AdminUserIndexRequest $request): JsonResponse
    {
        $admins = User::query()
            ->where('is_admin', true)
            ->when($request->filled('search'), fn ($q) => $q->where(function ($q) use ($request) {
                $s = $request->search;
                $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%");
            }))
            ->orderBy('name')
            ->paginate(25);

        return response()->json([
            'data' => AdminUserResource::collection($admins->getCollection()),
            'meta' => [
                'current_page' => $admins->currentPage(),
                'last_page' => $admins->lastPage(),
                'total' => $admins->total(),
            ],
        ]);
    }

    public function store(StoreAdminRequest $request): JsonResponse
    {
        $data = $request->validated();
        $admin = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'is_admin' => true,
            'is_env_admin' => false,
        ]);

        return response()->json(['data' => new AdminUserResource($admin)], 201);
    }

    public function show(User $admin): JsonResponse
    {
        if (! $admin->is_admin) {
            abort(404);
        }

        return response()->json(['data' => new AdminUserResource($admin)]);
    }

    public function update(Request $request, User $admin): JsonResponse
    {
        if (! $admin->is_admin) {
            abort(404);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,'.$admin->id],
            'password' => ['sometimes', 'string', 'min:8'],
        ]);

        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        $admin->update($data);

        return response()->json(['data' => new AdminUserResource($admin->fresh())]);
    }

    public function destroy(User $admin): JsonResponse
    {
        if (! $admin->is_admin) {
            abort(404);
        }

        if ($admin->is_env_admin) {
            return response()->json(['message' => 'Cannot delete the environment admin account.'], 403);
        }

        $admin->delete();

        return response()->json(null, 204);
    }
}
