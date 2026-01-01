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
            $table->string('sumber')->nullable()->after('name');
            $table->string('ktp')->nullable()->after('developer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agens', function (Blueprint $table) {
            $table->dropColumn(['sumber', 'ktp']);
        });
    }
};
