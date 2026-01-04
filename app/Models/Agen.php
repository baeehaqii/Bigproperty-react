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

    // Relasi ke Credit
    public function credits()
    {
        return $this->hasMany(AgenCredit::class);
    }

    // Relasi ke Transaksi Membership
    public function membershipTransactions()
    {
        return $this->hasMany(MembershipTransaction::class);
    }

    // Get active credits (belum expired)
    public function activeCredits()
    {
        return $this->credits()->active();
    }

    /**
     * Get total remaining highlight dari semua credit aktif
     */
    public function getTotalRemainingHighlightAttribute(): int
    {
        return $this->activeCredits()->sum('remaining_highlight');
    }

    /**
     * Get total remaining listing dari semua credit aktif
     */
    public function getTotalRemainingListingAttribute(): int
    {
        return $this->activeCredits()->sum('remaining_listing');
    }

    /**
     * Cek apakah agen punya highlight credit yang tersisa
     */
    public function hasHighlightCredit(): bool
    {
        return $this->activeCredits()->where('remaining_highlight', '>', 0)->exists();
    }

    /**
     * Cek apakah agen punya listing credit yang tersisa
     */
    public function hasListingCredit(): bool
    {
        return $this->activeCredits()->where('remaining_listing', '>', 0)->exists();
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