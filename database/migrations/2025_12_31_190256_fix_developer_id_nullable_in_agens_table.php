<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('agens', function (Blueprint $table) {
            // Fix developer_id to be properly nullable with default null
            $table->unsignedBigInteger('developer_id')->nullable()->default(null)->change();
            // Also fix user_id if needed
            $table->uuid('user_id')->nullable()->default(null)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agens', function (Blueprint $table) {
            // Revert changes if needed (optional as the down migration is rarely used)
        });
    }
};
