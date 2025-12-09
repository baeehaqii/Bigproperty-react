<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Developer extends Model
{

    protected $fillable = [
        'name', 
        "pt",
        'alamat',
        'logo', 
        "is_verified",
        "kontak",

        "nama_property",
        "email_perusahaan",
        "nib",
        "website",
        "sumber",



        "nama_pic",
    ];
    public function properties()
    {
        return $this->hasMany(Property::class);
    }
    public function agens()
    {
        return $this->hasMany(Agen::class);
    }

    // Scope untuk agen yang aktif dari developer ini
    public function activeAgens()
    {
        return $this->hasMany(Agen::class)->where('is_active', true);
    }
}