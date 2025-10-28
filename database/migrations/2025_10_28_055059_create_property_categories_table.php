<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon'); // Lucide icon name
            $table->enum('section', ['buy', 'rent', 'listing']); // Beli, Sewa, Titip Jual/Sewa
            $table->boolean('is_highlighted')->default(false);
            $table->boolean('has_badge')->default(false);
            $table->string('badge_text')->nullable();
            $table->string('badge_color')->default('red'); // red, blue, green, etc
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_categories');
    }
};