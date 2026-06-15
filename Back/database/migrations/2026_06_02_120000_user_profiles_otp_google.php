<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('address')->nullable()->after('phone');
            $table->text('personal_address')->nullable()->after('address');
            $table->decimal('location_lat', 10, 7)->nullable()->after('personal_address');
            $table->decimal('location_lng', 10, 7)->nullable()->after('location_lat');
            $table->string('photo')->nullable()->after('location_lng');
            $table->string('google_id')->nullable()->unique()->after('photo');
            $table->boolean('profile_complete')->default(true)->after('google_id');
            $table->string('store_name')->nullable()->after('company_name');
            $table->text('store_address')->nullable()->after('store_name');
            $table->string('shipper_identity')->nullable()->after('shipper_pin');
            $table->json('shipper_certificates')->nullable()->after('shipper_identity');
        });

        Schema::create('email_otps', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index();
            $table->string('code', 6);
            $table->string('purpose'); // register, login, admin_login, shipper_login
            $table->json('payload')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_otps');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'address', 'personal_address', 'location_lat', 'location_lng', 'photo',
                'google_id', 'profile_complete', 'store_name', 'store_address',
                'shipper_identity', 'shipper_certificates',
            ]);
        });
    }
};
