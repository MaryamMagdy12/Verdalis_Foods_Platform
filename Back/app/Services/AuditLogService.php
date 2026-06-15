<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Client;
use App\Models\Shipper;
use App\Models\User;
use Illuminate\Http\Request;

class AuditLogService
{
    public function log(
        string $action,
        Client|Shipper|User|null $actor = null,
        ?string $entityType = null,
        ?int $entityId = null,
        array $metadata = [],
        ?Request $request = null,
    ): AuditLog {
        $request ??= request();

        return AuditLog::create([
            'user_id' => $actor?->id,
            'role' => $this->resolveRole($actor),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => $metadata ?: null,
            'created_at' => now(),
        ]);
    }

    private function resolveRole(Client|Shipper|User|null $actor): ?string
    {
        if (! $actor) {
            return null;
        }

        if ($actor instanceof User) {
            return 'admin';
        }

        if ($actor instanceof Shipper) {
            return 'shipper';
        }

        return $actor->role === 'retailer' ? 'retailer' : 'client';
    }
}
