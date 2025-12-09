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
        Schema::create('kredit_users', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('jenis_membership')->nullable();
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
            $table->date('tgl_beli')->nullable();
            $table->date('tgl_selesai')->nullable();
            $table->integer('kredit_new_user')->nullable();
            $table->integer('kredit_listing')->nullable();
            $table->integer('kredit_highlight')->nullable();
            $table->integer('kredit_popup')->nullable();
            $table->integer('kredit_banner')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kredit_users');
    }
};
