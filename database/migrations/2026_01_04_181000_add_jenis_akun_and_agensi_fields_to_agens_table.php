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
        Schema::table('agens', function (Blueprint $table) {
            // Jenis akun agent
            if (!Schema::hasColumn('agens', 'jenis_akun')) {
                $table->enum('jenis_akun', ['agensi_broker', 'agent_perorangan', 'agent_developer'])
                    ->default('agent_perorangan')
                    ->after('developer_id')
                    ->comment('Tipe akun: agensi/broker, agent perorangan, agent developer');
            }

            // === Fields untuk Agensi/Broker ===

            // Nama agensi/broker
            if (!Schema::hasColumn('agens', 'nama_agensi')) {
                $table->string('nama_agensi')->nullable()->after('jenis_akun');
            }

            // Logo agensi/broker (URL Cloudinary)
            if (!Schema::hasColumn('agens', 'logo_agensi')) {
                $table->string('logo_agensi')->nullable()->after('nama_agensi');
            }

            // Email agensi/broker
            if (!Schema::hasColumn('agens', 'email_agensi')) {
                $table->string('email_agensi')->nullable()->after('logo_agensi');
            }

            // Website agensi/broker
            if (!Schema::hasColumn('agens', 'website_agensi')) {
                $table->string('website_agensi')->nullable()->after('email_agensi');
            }

            // === Fields untuk PIC (Person In Charge) - untuk agensi/broker ===

            // Nama PIC (yang juga bisa jadi 'name' untuk agent perorangan)
            if (!Schema::hasColumn('agens', 'nama_pic')) {
                $table->string('nama_pic')->nullable()->after('website_agensi');
            }

            // KTP PIC (URL Cloudinary)
            if (!Schema::hasColumn('agens', 'ktp_pic')) {
                $table->string('ktp_pic')->nullable()->after('nama_pic');
            }

            // Email PIC
            if (!Schema::hasColumn('agens', 'email_pic')) {
                $table->string('email_pic')->nullable()->after('ktp_pic');
            }

            // WhatsApp PIC
            if (!Schema::hasColumn('agens', 'wa_pic')) {
                $table->string('wa_pic')->nullable()->after('email_pic');
            }

            // Foto profil PIC (untuk agensi = foto PIC, untuk perorangan = foto profil)
            if (!Schema::hasColumn('agens', 'foto_pic')) {
                $table->string('foto_pic')->nullable()->after('wa_pic');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agens', function (Blueprint $table) {
            $columns = [
                'jenis_akun',
                'nama_agensi',
                'logo_agensi',
                'email_agensi',
                'website_agensi',
                'nama_pic',
                'ktp_pic',
                'email_pic',
                'wa_pic',
                'foto_pic',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('agens', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
