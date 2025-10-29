<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('golden_deals_properties', function (Blueprint $table) {
            $table->id();
            $table->string('image')->nullable();
            $table->enum('type', ['Rumah Baru', 'Apartemen', 'Kavling']);
            $table->string('badge')->nullable();
            $table->string('type_extra')->nullable();
            $table->decimal('price_min', 15, 2);
            $table->decimal('price_max', 15, 2);
            $table->string('price_range')->nullable();
            $table->decimal('installment_amount', 15, 2);
            $table->string('installment_text')->nullable();
            $table->string('property_name');
            $table->foreignId('developer_id')->constrained();
            $table->string('location_district');
            $table->string('location_city');
            $table->integer('bedrooms');
            $table->integer('land_size');
            $table->integer('building_size');
            $table->boolean('has_shm')->default(false);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('golden_deals_properties');
    }
};