<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistoryPembelian extends Model
{
    protected $fillable = [
        "user_id",
        "membership_id",
        "membership_type",
        "purchase_date",
        "amount",
        "duration_months",
        "start_date",
        "end_date",
    ];

    protected $casts = [
        'purchase_date' => 'datetime',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function membership()
    {
        return $this->belongsTo(Membership::class);
    }
}