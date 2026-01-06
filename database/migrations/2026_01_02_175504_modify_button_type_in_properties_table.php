<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, update existing values to match new enum
        DB::table('properties')->where('button_type', 'view')->update(['button_type' => 'view_details']);
        DB::table('properties')->where('button_type', 'chat')->update(['button_type' => 'whatsapp']);

        // Change the column to string to support more button types
        Schema::table('properties', function (Blueprint $table) {
            $table->string('button_type', 50)->default('whatsapp')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->enum('button_type', ['view', 'chat'])->default('view')->change();
        });
    }
};
