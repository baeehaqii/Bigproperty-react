<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\KreditUser;
use Carbon\Carbon;

class ResetExpiredMembershipCredits extends Command
{
    protected $signature = 'membership:reset-expired-credits';
    
    protected $description = 'Reset kredit untuk membership yang sudah expired (kecuali kredit_new_user)';

    public function handle()
    {
        $this->info('Mengecek membership yang expired...');

        // Ambil semua membership yang udah lewat tgl_selesai
        $expiredMemberships = KreditUser::where('tgl_selesai', '<', now())
            ->where(function($query) {
                $query->where('kredit_listing', '>', 0)
                    ->orWhere('kredit_highlight', '>', 0)
                    ->orWhere('kredit_popup', '>', 0)
                    ->orWhere('kredit_banner', '>', 0);
            })
            ->get();

        if ($expiredMemberships->isEmpty()) {
            $this->info('Tidak ada membership expired yang perlu direset.');
            return 0;
        }

        $count = 0;
        foreach ($expiredMemberships as $membership) {
            // Reset semua kredit kecuali kredit_new_user
            $membership->update([
                'kredit_listing' => 0,
                'kredit_highlight' => 0,
                'kredit_popup' => 0,
                'kredit_banner' => 0,
            ]);
            
            $count++;
            $this->line("Reset kredit untuk User ID: {$membership->user_id}");
        }

        $this->info("Berhasil reset {$count} membership yang expired.");
        return 0;
    }
}