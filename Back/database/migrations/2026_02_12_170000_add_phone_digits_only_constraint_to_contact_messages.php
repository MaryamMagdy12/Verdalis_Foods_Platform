<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE contact_messages ADD CONSTRAINT contact_messages_phone_digits_only CHECK (phone REGEXP "^[0-9]+$")');
        }

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE contact_messages ADD CONSTRAINT contact_messages_phone_digits_only CHECK (phone ~ \'^[0-9]+$\')');
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql' || $driver === 'pgsql') {
            DB::statement('ALTER TABLE contact_messages DROP CONSTRAINT IF EXISTS contact_messages_phone_digits_only');
        }
    }
};
