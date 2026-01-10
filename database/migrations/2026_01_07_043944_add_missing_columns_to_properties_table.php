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
        Schema::table('properties', function (Blueprint $table) {
            if (!Schema::hasColumn('properties', 'pajak')) {
                $table->decimal('pajak', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('properties', 'notaris')) {
                $table->decimal('notaris', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('properties', 'jenis_air')) {
                $table->string('jenis_air')->nullable();
            }
            if (!Schema::hasColumn('properties', 'condition')) {
                $table->string('condition')->nullable();
            }
            if (!Schema::hasColumn('properties', 'nearby_places')) {
                $table->json('nearby_places')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['pajak', 'notaris', 'jenis_air', 'condition', 'nearby_places']);
        });
    }
};
