<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visitor extends Model
{
    protected $fillable = [
        "user_id", // TAMBAHKAN INI
        "nama",
        "ktp",
        "no_wa",
        "photo",
        "sumber",
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
