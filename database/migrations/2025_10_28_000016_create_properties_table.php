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
            $table->foreignId('developer_id')->nullable()->constrained('developers')->cascadeOnDelete();
            $table->foreignId('agen_id')->nullable()->constrained('agens')->cascadeOnDelete();

            $table->string('city');
            $table->string('provinsi');

            $table->string('name');
            $table->integer('units_remaining')->nullable();
            $table->decimal('price_min', 15, 2);
            $table->decimal('price_max', 15, 2)->nullable();
            $table->decimal('installment_start', 15, 2);
            $table->string('location');
            $table->integer('bedrooms'); 
            $table->integer('land_size_min');
            $table->integer('land_size_max')->nullable();
            $table->integer('building_size_min')->nullable();
            $table->integer('building_size_max')->nullable();
            $table->string('certificate_type')->nullable(); 
            $table->text('promo_text')->nullable();
            $table->json('kategori')->nullable();
            $table->string('url_maps')->nullable();
            $table->json('images');
            $table->string('main_image')->nullable();
            $table->boolean('is_popular')->default(false);
            $table->integer('count_clicked')->default(0);
            $table->timestamp('last_updated')->nullable();
            $table->json('keunggulan')->nullable();
            $table->string('button_type')->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();
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