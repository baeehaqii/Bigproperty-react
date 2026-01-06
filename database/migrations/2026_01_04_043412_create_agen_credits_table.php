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
        Schema::create('agen_credits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agen_id')->constrained('agens')->onDelete('cascade');
            $table->foreignId('membership_id')->constrained('memberships');

            // Saldo yang bisa dikonsumsi
            $table->integer('remaining_listing')->default(0);
            $table->integer('remaining_highlight')->default(0);
            $table->integer('remaining_agent_slots')->default(0);

            // Masa Berlaku
            $table->timestamp('expired_at')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agen_credits');
    }
};
