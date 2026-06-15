<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Main admin is created via web: POST /api/admin/setup (when no admin exists).
     * Run this seeder only to keep the class; do not create admin here.
     */
    public function run(): void
    {
        //
    }
}
