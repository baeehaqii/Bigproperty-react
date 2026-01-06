<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * Add additional property filter fields and optimize indexes for search performance
     */
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // Additional filter fields
            $table->integer('bathrooms')->nullable()->after('bedrooms');
            $table->integer('carport')->nullable()->after('bathrooms');
            $table->integer('listrik')->nullable()->after('carport');
            $table->enum('market_type', ['baru', 'second', 'lelang'])->default('baru')->after('listrik');
            $table->enum('construction_status', ['dalam_pembangunan', 'siap_huni'])->default('siap_huni')->after('market_type');
            $table->boolean('is_verified')->default(false)->after('is_popular');
            $table->boolean('has_promo')->default(false)->after('is_verified');
            $table->boolean('tanpa_perantara')->default(false)->after('has_promo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // Drop composite indexes
            $table->dropIndex('idx_available_price');
            $table->dropIndex('idx_available_rooms');
            $table->dropIndex('idx_available_market');
            $table->dropIndex('idx_available_developer');

            // Drop single column indexes
            $table->dropIndex(['price_min']);
            $table->dropIndex(['price_max']);
            $table->dropIndex(['bedrooms']);
            $table->dropIndex(['bathrooms']);
            $table->dropIndex(['land_size_min']);
            $table->dropIndex(['land_size_max']);
            $table->dropIndex(['building_size_min']);
            $table->dropIndex(['building_size_max']);
            $table->dropIndex(['certificate_type']);
            $table->dropIndex(['carport']);
            $table->dropIndex(['listrik']);
            $table->dropIndex(['market_type']);
            $table->dropIndex(['construction_status']);
            $table->dropIndex(['developer_id']);
            $table->dropIndex(['is_verified']);
            $table->dropIndex(['has_promo']);
            $table->dropIndex(['tanpa_perantara']);

            // Drop columns
            $table->dropColumn([
                'bathrooms',
                'carport',
                'listrik',
                'market_type',
                'construction_status',
                'is_verified',
                'has_promo',
                'tanpa_perantara',
            ]);
        });
    }
};
