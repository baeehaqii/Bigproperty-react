<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class KreditUser extends Model
{
    protected $fillable = [
        "user_id",
        "tgl_beli",
        "jenis_membership",
        "tgl_selesai",
        "kredit_new_user",
        "kredit_listing",
        "kredit_highlight",
        "kredit_popup",
        "kredit_banner",
    ];

    protected $casts = [
        'tgl_beli' => 'datetime',
        'tgl_selesai' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper: cek apakah membership masih aktif
    public function isActive()
    {
        return $this->tgl_selesai && $this->tgl_selesai->isFuture();
    }

    // Helper: sisa hari membership
    public function daysRemaining()
    {
        if (!$this->tgl_selesai) return 0;
        return max(0, now()->diffInDays($this->tgl_selesai, false));
    }
}