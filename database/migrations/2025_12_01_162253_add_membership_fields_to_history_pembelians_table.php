<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('history_pembelians', function (Blueprint $table) {
            $table->foreignId('membership_id')->nullable()->after('user_id')->constrained()->onDelete('set null');
            $table->integer('duration_months')->nullable()->after('membership_type');
            $table->dateTime('start_date')->nullable()->after('duration_months');
            $table->dateTime('end_date')->nullable()->after('start_date');
        });
    }

    public function down(): void
    {
        Schema::table('history_pembelians', function (Blueprint $table) {
            $table->dropForeign(['membership_id']);
            $table->dropColumn(['membership_id', 'duration_months', 'start_date', 'end_date']);
        });
    }
};