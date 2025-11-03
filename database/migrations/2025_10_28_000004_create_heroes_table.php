<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('heroes', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->text('deskripsi')->nullable();

            $table->json('image');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('link_url')->nullable();
            $table->string('link_text')->nullable();
            $table->string('main_color')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('heroes');
    }
};