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
        Schema::create('membership_transactions', function (Blueprint $table) {
            $table->id();
            // Relasi ke agen yang membeli
            $table->foreignId('agen_id')->constrained('agens')->onDelete('cascade');
            // Relasi ke paket yang dibeli
            $table->foreignId('membership_id')->constrained('memberships');

            // Data untuk Midtrans
            $table->string('order_id')->unique(); // Format: INV-HGL-{timestamp}-{id}
            $table->decimal('gross_amount', 15, 2);
            $table->string('status')->default('pending'); // pending, settlement, expire, cancel
            $table->string('payment_type')->nullable(); // qris, bank_transfer, dll
            $table->string('snap_token')->nullable(); // Untuk memunculkan pop-up Midtrans kembali

            // Payload mentah (opsional untuk audit/debug)
            $table->json('payload_midtrans')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_transactions');
    }
};
