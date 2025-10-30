<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->nullable()->constrained('events')->nullOnDelete();
            // Basic Info
            $table->string('city');
            $table->string('provinsi');

            $table->string('name');
            $table->integer('units_remaining')->nullable();
            // Price Info
            $table->decimal('price_min', 15, 2);
            $table->decimal('price_max', 15, 2)->nullable();
            $table->decimal('installment_start', 15, 2);
        
            // Location
            $table->string('location');
            
            // Property Details
            $table->integer('bedrooms'); // "2-3 KT" atau "3 KT"
            $table->integer('land_size_min');
            $table->integer('land_size_max')->nullable();
            $table->integer('building_size_min')->nullable();
            $table->integer('building_size_max')->nullable();
            $table->string('certificate_type')->nullable(); // SHM, HGB, dll
            
            // Marketing
            $table->text('promo_text')->nullable();
            $table->json('features')->nullable();
            
            // Images
            $table->json('images');
            $table->string('main_image')->nullable();
            
            // Status
            $table->enum('button_type', ['view', 'chat'])->default('view');
            $table->boolean('is_available')->default(true);
            $table->boolean('is_popular')->default(false);
            

            $table->timestamp('last_updated')->nullable();
            $table->timestamps();
            $table->json('kategori')->nullable();
            // Indexes
            $table->index(['is_popular']);
            $table->index('is_available');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};