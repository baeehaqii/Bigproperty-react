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
        Schema::create('memberships', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->enum('jenis', ['agen', 'developer', 'highlight']);
            $table->text('deskripsi')->nullable();
            $table->json('harga')->nullable(); // {amount: 6000000, duration: 1, period: 'year'}
            $table->json('jumlah_listing')->nullable(); // {quantity: 100, duration: 1, period: 'year'}
            $table->json('jumlah_highlight')->nullable(); // {quantity: 30, duration: 7, period: 'day'}
            $table->integer('jumlah_agent')->default(0)->nullable();
            $table->json('popup_ads')->nullable(); // {duration: 3, period: 'day'}
            $table->json('banner_ads')->nullable(); // {duration: 7, period: 'day'}
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('memberships');
    }
};