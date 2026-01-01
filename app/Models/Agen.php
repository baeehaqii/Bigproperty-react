<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Agen extends Authenticatable
{
    use SoftDeletes, Notifiable;

    protected $table = 'agens';

    protected $fillable = [
        'developer_id',
        "ktp",
        'name',
        'email',
        'password',
        'phone',
        'photo',
        'license_number',
        'is_active',
        "user_id",
        "sumber",
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Relasi ke Developer
    public function developer()
    {
        return $this->belongsTo(Developer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    // Relasi ke Property (agen yang upload property)
    public function properties()
    {
        return $this->hasMany(Property::class);
    }

    // Scope untuk agen yang aktif
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessor untuk WhatsApp link
    public function getWhatsappLinkAttribute()
    {
        if ($this->whatsapp) {
            $number = preg_replace('/[^0-9]/', '', $this->whatsapp);
            if (substr($number, 0, 1) === '0') {
                $number = '62' . substr($number, 1);
            }
            return "https://wa.me/{$number}";
        }
        return null;
    }
}