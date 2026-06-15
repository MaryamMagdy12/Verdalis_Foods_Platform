<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('initial_stock')->nullable()->after('stock');
        });

        DB::table('products')->whereNull('initial_stock')->update([
            'initial_stock' => DB::raw('COALESCE(stock, 0)'),
        ]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('initial_stock');
        });
    }
};
