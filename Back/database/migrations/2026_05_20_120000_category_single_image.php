<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('categories', 'image')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->string('image')->nullable()->after('description');
            });
        }

        if (Schema::hasColumn('categories', 'thumbnail') || Schema::hasColumn('categories', 'main_image')) {
            foreach (DB::table('categories')->orderBy('id')->get() as $row) {
                $path = $row->thumbnail ?? $row->main_image ?? $row->banner_image ?? null;
                if ($path && empty($row->image)) {
                    DB::table('categories')->where('id', $row->id)->update(['image' => $path]);
                }
            }
        }

        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'main_image')) {
                $table->dropColumn('main_image');
            }
            if (Schema::hasColumn('categories', 'banner_image')) {
                $table->dropColumn('banner_image');
            }
            if (Schema::hasColumn('categories', 'thumbnail')) {
                $table->dropColumn('thumbnail');
            }
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('main_image')->nullable();
            $table->string('banner_image')->nullable();
            $table->string('thumbnail')->nullable();
        });

        DB::table('categories')->orderBy('id')->each(function ($row) {
            if ($row->image) {
                DB::table('categories')->where('id', $row->id)->update([
                    'thumbnail' => $row->image,
                ]);
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};
