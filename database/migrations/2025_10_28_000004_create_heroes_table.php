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
        Schema::create('heroes', function (Blueprint $table) {
$table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('description')->nullable();
            $table->string('primary_cta_text')->nullable();
            $table->string('primary_cta_link')->nullable();
            $table->string('secondary_cta_text')->nullable();
            $table->string('secondary_cta_link')->nullable();
            $table->string('background_image')->nullable();
            $table->string('background_video')->nullable();
            $table->integer('overlay_opacity')->default(50);
            $table->enum('text_alignment', ['left', 'center', 'right'])->default('center');
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('heroes');
    }
};
