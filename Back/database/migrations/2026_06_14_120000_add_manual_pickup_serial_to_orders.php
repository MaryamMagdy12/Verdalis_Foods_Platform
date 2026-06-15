<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('pickup_truck_number', 64)->nullable()->after('pickup_photo');
            $table->string('pickup_serial_hash')->nullable()->after('pickup_truck_number');
            $table->timestamp('pickup_serial_expires_at')->nullable()->after('pickup_serial_hash');
            $table->timestamp('pickup_serial_used_at')->nullable()->after('pickup_serial_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'pickup_truck_number',
                'pickup_serial_hash',
                'pickup_serial_expires_at',
                'pickup_serial_used_at',
            ]);
        });
    }
};
