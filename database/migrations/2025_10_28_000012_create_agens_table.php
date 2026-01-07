<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('agens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('developer_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignUuid('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('ktp')->nullable();
            $table->string('sumber')->nullable();
            $table->string('email')->nullable();
            $table->string('phone');
            $table->string('photo')->nullable();
            $table->string('license_number')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('agens');
    }
};