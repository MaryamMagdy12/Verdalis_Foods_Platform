<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('gateway', 50)->default('stripe');
            $table->string('gateway_reference')->nullable()->index();
            $table->string('idempotency_key', 64)->unique();
            $table->string('status', 30)->default('pending');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('CAD');
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('role', 30)->nullable();
            $table->string('action', 100);
            $table->string('entity_type', 100)->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['entity_type', 'entity_id']);
            $table->index(['action', 'created_at']);
            $table->index('user_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('tracking_token', 64)->nullable()->unique()->after('order_number');
            $table->string('delivery_otp_hash')->nullable()->after('delivery_otp');
            $table->unsignedTinyInteger('delivery_otp_attempts')->default(0)->after('delivery_otp_hash');
            $table->timestamp('delivery_otp_locked_until')->nullable()->after('delivery_otp_attempts');
            $table->timestamp('delivery_otp_verified_at')->nullable()->after('delivery_otp_locked_until');
            $table->timestamp('qr_used_at')->nullable()->after('qr_payload');
            $table->timestamp('payment_expires_at')->nullable()->after('paid_at');
            $table->timestamp('stock_reserved_at')->nullable()->after('payment_expires_at');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('stock_reserved')->default(0)->after('stock');
        });

        Schema::table('shippers', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('photo');
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->index('email');
            $table->index(['role', 'retailer_status']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index(['order_number', 'tracking_token']);
            $table->index(['shipper_id', 'status']);
            $table->index('client_id');
        });

        Schema::table('email_otps', function (Blueprint $table) {
            $table->index(['email', 'purpose']);
        });

        // Migrate plaintext delivery OTP to hash
        if (Schema::hasColumn('orders', 'delivery_otp')) {
            DB::table('orders')
                ->whereNotNull('delivery_otp')
                ->whereNull('delivery_otp_hash')
                ->orderBy('id')
                ->chunkById(100, function ($orders) {
                    foreach ($orders as $order) {
                        DB::table('orders')->where('id', $order->id)->update([
                            'delivery_otp_hash' => Hash::make($order->delivery_otp),
                        ]);
                    }
                });
        }

        // Hash existing shipper PINs
        if (Schema::hasColumn('shippers', 'shipper_pin')) {
            DB::table('shippers')
                ->whereNotNull('shipper_pin')
                ->orderBy('id')
                ->chunkById(100, function ($shippers) {
                    foreach ($shippers as $shipper) {
                        $pin = $shipper->shipper_pin;
                        if ($pin && ! str_starts_with($pin, '$2y$')) {
                            DB::table('shippers')->where('id', $shipper->id)->update([
                                'shipper_pin' => Hash::make($pin),
                            ]);
                        }
                    }
                });
        }

        // Generate tracking tokens for existing orders
        DB::table('orders')
            ->whereNull('tracking_token')
            ->orderBy('id')
            ->chunkById(100, function ($orders) {
                foreach ($orders as $order) {
                    DB::table('orders')->where('id', $order->id)->update([
                        'tracking_token' => bin2hex(random_bytes(32)),
                    ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('email_otps', function (Blueprint $table) {
            $table->dropIndex(['email', 'purpose']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['order_number', 'tracking_token']);
            $table->dropIndex(['shipper_id', 'status']);
            $table->dropIndex(['client_id']);
            $table->dropColumn([
                'tracking_token',
                'delivery_otp_hash',
                'delivery_otp_attempts',
                'delivery_otp_locked_until',
                'delivery_otp_verified_at',
                'qr_used_at',
                'payment_expires_at',
                'stock_reserved_at',
            ]);
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropIndex(['role', 'retailer_status']);
        });

        Schema::table('shippers', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('stock_reserved');
        });

        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('payment_transactions');
    }
};
