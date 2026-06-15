<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Remove brands system
        if (Schema::hasColumn('products', 'brand_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropForeign(['brand_id']);
                $table->dropColumn('brand_id');
            });
        }
        Schema::dropIfExists('brands');

        // Expand categories
        Schema::table('categories', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
            $table->text('description')->nullable()->after('slug');
            $table->string('main_image')->nullable();
            $table->string('banner_image')->nullable();
            $table->string('thumbnail')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
        });

        // Expand products
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->default(0)->after('sku');
            $table->decimal('wholesale_price', 10, 2)->nullable()->after('price');
            $table->unsignedInteger('stock')->default(0)->after('wholesale_price');
            $table->unsignedInteger('min_quantity')->default(1)->after('stock');
            $table->unsignedInteger('wholesale_min_quantity')->default(1)->after('min_quantity');
            $table->string('weight')->nullable();
            $table->string('size')->nullable();
            $table->json('images')->nullable();
            $table->json('badges')->nullable();
            $table->decimal('discount_percent', 5, 2)->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('is_active')->default(true);
        });

        // Expand users
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('client')->after('email'); // admin, client, retailer, shipper
            $table->string('phone')->nullable();
            $table->string('company_name')->nullable();
            $table->string('retailer_status')->nullable(); // pending, approved, rejected
            $table->string('shipper_pin')->nullable();
            $table->timestamp('last_activity_at')->nullable();
        });

        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label')->default('Home');
            $table->string('line1');
            $table->string('line2')->nullable();
            $table->string('city');
            $table->string('province')->nullable();
            $table->string('postal_code');
            $table->string('country')->default('CA');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shipper_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('pending_payment');
            $table->string('payment_status')->default('pending');
            $table->string('payment_method')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('shipping', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->string('coupon_code')->nullable();
            $table->json('shipping_address')->nullable();
            $table->string('delivery_token', 64)->unique();
            $table->string('delivery_otp', 8)->nullable();
            $table->string('qr_payload')->nullable();
            $table->boolean('is_wholesale')->default(false);
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->decimal('pickup_latitude', 10, 7)->nullable();
            $table->decimal('pickup_longitude', 10, 7)->nullable();
            $table->decimal('delivery_latitude', 10, 7)->nullable();
            $table->decimal('delivery_longitude', 10, 7)->nullable();
            $table->string('pickup_photo')->nullable();
            $table->string('delivery_photo')->nullable();
            $table->string('delivery_signature')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();
            $table->index(['status', 'payment_status']);
            $table->index('created_at');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('sku')->nullable();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('line_total', 12, 2);
            $table->timestamps();
        });

        Schema::create('delivery_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shipper_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event_type');
            $table->string('status_before')->nullable();
            $table->string('status_after')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('photo')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('body');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'read_at']);
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'product_id']);
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type')->default('percent'); // percent, fixed
            $table->decimal('value', 10, 2);
            $table->decimal('min_order', 10, 2)->nullable();
            $table->unsignedInteger('max_uses')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('quotation_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->json('items');
            $table->text('notes')->nullable();
            $table->decimal('quoted_total', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotation_requests');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('delivery_events');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('addresses');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'company_name', 'retailer_status', 'shipper_pin', 'last_activity_at']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'price', 'wholesale_price', 'stock', 'min_quantity', 'wholesale_min_quantity',
                'weight', 'size', 'images', 'badges', 'discount_percent', 'featured', 'is_active',
            ]);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn([
                'slug', 'description', 'main_image', 'banner_image', 'thumbnail',
                'is_active', 'sort_order', 'seo_title', 'seo_description',
            ]);
        });

        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo')->nullable();
            $table->timestamps();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
        });
    }
};
