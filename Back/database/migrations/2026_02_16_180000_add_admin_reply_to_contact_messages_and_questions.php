<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->text('admin_reply')->nullable()->after('replied_at');
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->text('admin_reply')->nullable()->after('replied_at');
        });
    }

    public function down(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->dropColumn('admin_reply');
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn('admin_reply');
        });
    }
};
