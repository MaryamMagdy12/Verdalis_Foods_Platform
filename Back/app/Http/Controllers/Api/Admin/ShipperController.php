<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ShipperIndexRequest;
use App\Http\Requests\Admin\StoreShipperRequest;
use App\Http\Requests\Admin\UpdateShipperRequest;
use App\Http\Resources\Admin\ShipperResource;
use App\Models\Shipper;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ShipperController extends Controller
{
    public function __construct(private AuditLogService $audit) {}

    public function index(ShipperIndexRequest $request): JsonResponse
    {
        $shippers = Shipper::query()
            ->when($request->filled('search'), fn ($q) => $q->where(function ($q) use ($request) {
                $s = $request->search;
                $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%");
            }))
            ->orderBy('name')
            ->paginate(25);

        return response()->json([
            'data' => ShipperResource::collection($shippers->getCollection()),
            'meta' => [
                'current_page' => $shippers->currentPage(),
                'last_page' => $shippers->lastPage(),
                'total' => $shippers->total(),
            ],
        ]);
    }

    public function store(StoreShipperRequest $request): JsonResponse
    {
        $data = $request->validated();

        $photoPath = $request->file('photo')->store('shippers/photos', 'public');
        $identityPath = $request->file('identity')->store('shippers/identity', 'local');

        $certificatePaths = [];
        foreach ($request->file('certificates', []) as $file) {
            $certificatePaths[] = $file->store('shippers/certificates', 'local');
        }

        $shipper = Shipper::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'phone' => $data['phone'],
            'address' => $data['address'],
            'shipper_pin' => $data['shipper_pin'],
            'shipper_identity' => $identityPath,
            'shipper_certificates' => $certificatePaths,
            'photo' => $photoPath,
            'is_active' => true,
        ]);

        $this->audit->log('shipper_created', $request->user(), Shipper::class, $shipper->id);

        return response()->json(['data' => new ShipperResource($shipper)], 201);
    }

    public function show(Shipper $shipper): JsonResponse
    {
        return response()->json(['data' => new ShipperResource($shipper)]);
    }

    public function update(UpdateShipperRequest $request, Shipper $shipper): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        if (empty($data['shipper_pin'])) {
            unset($data['shipper_pin']);
        }

        if ($request->hasFile('photo')) {
            if ($shipper->photo) {
                Storage::disk('public')->delete($shipper->photo);
            }
            $data['photo'] = $request->file('photo')->store('shippers/photos', 'public');
        }

        if ($request->hasFile('identity')) {
            if ($shipper->shipper_identity) {
                Storage::disk('local')->delete($shipper->shipper_identity);
            }
            $data['shipper_identity'] = $request->file('identity')->store('shippers/identity', 'local');
        }

        if ($request->hasFile('certificates')) {
            foreach ($shipper->shipper_certificates ?? [] as $path) {
                Storage::disk('local')->delete($path);
            }
            $certificatePaths = [];
            foreach ($request->file('certificates', []) as $file) {
                $certificatePaths[] = $file->store('shippers/certificates', 'local');
            }
            $data['shipper_certificates'] = $certificatePaths;
        }

        unset($data['identity'], $data['certificates']);

        $shipper->update($data);
        $this->audit->log('shipper_updated', $request->user(), Shipper::class, $shipper->id);

        return response()->json(['data' => new ShipperResource($shipper->fresh())]);
    }

    public function destroy(Shipper $shipper): JsonResponse
    {
        $shipper->delete();

        return response()->json(null, 204);
    }

    public function downloadIdentity(Shipper $shipper): BinaryFileResponse
    {
        if (! $shipper->shipper_identity || ! Storage::disk('local')->exists($shipper->shipper_identity)) {
            abort(404);
        }

        $this->audit->log('shipper_identity_accessed', request()->user(), Shipper::class, $shipper->id);

        return response()->download(
            Storage::disk('local')->path($shipper->shipper_identity),
            basename($shipper->shipper_identity)
        );
    }

    public function downloadCertificate(Shipper $shipper, int $index): BinaryFileResponse
    {
        $certificates = $shipper->shipper_certificates ?? [];
        $path = $certificates[$index] ?? null;

        if (! $path || ! Storage::disk('local')->exists($path)) {
            abort(404);
        }

        $this->audit->log('shipper_certificate_accessed', request()->user(), Shipper::class, $shipper->id, ['index' => $index]);

        return response()->download(
            Storage::disk('local')->path($path),
            basename($path)
        );
    }
}
