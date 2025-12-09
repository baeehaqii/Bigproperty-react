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
        Schema::create('developers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('pt');

            $table->string('alamat');
            $table->json('list_property')->nullable();
            $table->string('logo')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->string('kontak')->nullable();
            $table->string('nama_property')->nullable();
            $table->string('email_perusahaan')->nullable();
            $table->string('nib')->nullable();
            $table->string('website')->nullable();
            $table->string('sumber')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('developers');
    }
};
