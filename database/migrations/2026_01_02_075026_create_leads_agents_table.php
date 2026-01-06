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
        Schema::create('leads_agents', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lengkap');
            $table->string('no_whatsapp');
            $table->string('email')->nullable();
            $table->string('listing_source'); // Dari listing mana
            $table->unsignedBigInteger('property_id')->nullable();
            $table->unsignedBigInteger('agent_id');
            $table->enum('status_lead', ['cold', 'warm', 'hot'])->default('cold');
            $table->enum('status_followup', ['belum', 'sudah'])->default('belum');
            $table->date('tanggal_leads');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('set null');
            $table->foreign('agent_id')->references('id')->on('agens')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads_agents');
    }
};
