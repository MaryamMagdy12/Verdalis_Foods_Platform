<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('clients')) {
            Schema::create('clients', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->rememberToken();
                $table->string('role')->default('client');
                $table->string('phone')->nullable();
                $table->text('address')->nullable();
                $table->text('personal_address')->nullable();
                $table->decimal('location_lat', 10, 7)->nullable();
                $table->decimal('location_lng', 10, 7)->nullable();
                $table->string('photo')->nullable();
                $table->string('google_id')->nullable()->unique();
                $table->boolean('profile_complete')->default(true);
                $table->string('company_name')->nullable();
                $table->string('store_name')->nullable();
                $table->text('store_address')->nullable();
                $table->string('retailer_status')->nullable();
                $table->timestamp('last_activity_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('shippers')) {
            Schema::create('shippers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->rememberToken();
                $table->string('phone')->nullable();
                $table->string('shipper_pin')->nullable();
                $table->string('shipper_identity')->nullable();
                $table->json('shipper_certificates')->nullable();
                $table->string('photo')->nullable();
                $table->timestamp('last_activity_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasColumn('users', 'role')) {
            return;
        }

        if (DB::table('clients')->count() === 0) {
            DB::statement("
                INSERT INTO clients (
                    id, name, email, email_verified_at, password, remember_token, role, phone,
                    address, personal_address, location_lat, location_lng, photo, google_id,
                    profile_complete, company_name, store_name, store_address, retailer_status,
                    last_activity_at, created_at, updated_at
                )
                SELECT
                    id, name, email, email_verified_at, password, remember_token, role, phone,
                    address, personal_address, location_lat, location_lng, photo, google_id,
                    profile_complete, company_name, store_name, store_address, retailer_status,
                    last_activity_at, created_at, updated_at
                FROM users
                WHERE role IN ('client', 'retailer')
            ");
        }

        if (DB::table('shippers')->count() === 0) {
            DB::statement("
                INSERT INTO shippers (
                    id, name, email, email_verified_at, password, remember_token, phone,
                    shipper_pin, shipper_identity, shipper_certificates, photo, last_activity_at,
                    created_at, updated_at
                )
                SELECT
                    id, name, email, email_verified_at, password, remember_token, phone,
                    shipper_pin, shipper_identity, shipper_certificates, photo, last_activity_at,
                    created_at, updated_at
                FROM users
                WHERE role = 'shipper'
            ");
        }

        $this->migrateClientFk('addresses', 'user_id');
        $this->migrateClientFk('orders', 'user_id', 'order_number');

        if (Schema::hasColumn('orders', 'shipper_id')) {
            try {
                Schema::table('orders', function (Blueprint $table) {
                    $table->dropForeign(['shipper_id']);
                });
            } catch (\Throwable) {
            }
            Schema::table('orders', function (Blueprint $table) {
                $table->foreign('shipper_id')->references('id')->on('shippers')->nullOnDelete();
            });
        }

        if (! Schema::hasColumn('notifications', 'notifiable_type')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->nullableMorphs('notifiable');
            });
        }

        if (Schema::hasColumn('notifications', 'user_id')) {
            $clientIds = DB::table('clients')->pluck('id')->flip();
            $shipperIds = DB::table('shippers')->pluck('id')->flip();

            foreach (DB::table('notifications')->orderBy('id')->get() as $row) {
                if ($row->notifiable_type) {
                    continue;
                }
                $type = isset($clientIds[$row->user_id])
                    ? 'App\\Models\\Client'
                    : (isset($shipperIds[$row->user_id]) ? 'App\\Models\\Shipper' : 'App\\Models\\User');
                DB::table('notifications')->where('id', $row->id)->update([
                    'notifiable_type' => $type,
                    'notifiable_id' => $row->user_id,
                ]);
            }

            Schema::table('notifications', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            });
        }

        if (Schema::hasTable('delivery_events') && Schema::hasColumn('delivery_events', 'shipper_id')) {
            try {
                Schema::table('delivery_events', function (Blueprint $table) {
                    $table->dropForeign(['shipper_id']);
                });
            } catch (\Throwable) {
            }
            Schema::table('delivery_events', function (Blueprint $table) {
                $table->foreign('shipper_id')->references('id')->on('shippers')->nullOnDelete();
            });
        }

        foreach (DB::table('personal_access_tokens')
            ->where('tokenable_type', 'App\\Models\\User')
            ->orderBy('id')
            ->get() as $token) {
            $id = $token->tokenable_id;
            if (DB::table('clients')->where('id', $id)->exists()) {
                DB::table('personal_access_tokens')->where('id', $token->id)->update([
                    'tokenable_type' => 'App\\Models\\Client',
                ]);
            } elseif (DB::table('shippers')->where('id', $id)->exists()) {
                DB::table('personal_access_tokens')->where('id', $token->id)->update([
                    'tokenable_type' => 'App\\Models\\Shipper',
                ]);
            }
        }

        DB::table('users')->where(function ($q) {
            $q->where('is_admin', false)->orWhereNull('is_admin');
        })->where(function ($q) {
            $q->where('role', '!=', 'admin')->orWhereNull('role');
        })->delete();

        Schema::table('users', function (Blueprint $table) {
            foreach ([
                'role', 'phone', 'company_name', 'retailer_status', 'shipper_pin',
                'address', 'personal_address', 'location_lat', 'location_lng', 'photo',
                'google_id', 'profile_complete', 'store_name', 'store_address',
                'shipper_identity', 'shipper_certificates',
            ] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }

    private function migrateClientFk(string $table, string $oldColumn, ?string $after = null): void
    {
        if (! Schema::hasColumn($table, $oldColumn)) {
            return;
        }

        if (! Schema::hasColumn($table, 'client_id')) {
            Schema::table($table, function (Blueprint $blueprint) use ($after) {
                if ($after) {
                    $blueprint->unsignedBigInteger('client_id')->nullable()->after($after);
                } else {
                    $blueprint->unsignedBigInteger('client_id')->nullable()->after('id');
                }
            });
        }

        DB::statement("UPDATE {$table} SET client_id = {$oldColumn} WHERE {$oldColumn} IN (SELECT id FROM clients)");

        Schema::table($table, function (Blueprint $blueprint) use ($table, $oldColumn) {
            if ($this->hasForeign($table, $oldColumn)) {
                $blueprint->dropForeign([$oldColumn]);
            }
            $blueprint->dropColumn($oldColumn);
        });

        if (! $this->hasForeign($table, 'client_id')) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->foreign('client_id')->references('id')->on('clients')->cascadeOnDelete();
            });
        }
    }

    private function hasForeign(string $table, string $column): bool
    {
        $db = Schema::getConnection()->getDatabaseName();
        $row = DB::selectOne(
            'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL LIMIT 1',
            [$db, $table, $column]
        );

        return $row !== null;
    }

    public function down(): void
    {
    }
};
