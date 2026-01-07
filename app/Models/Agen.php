<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Agen extends Authenticatable
{
    use SoftDeletes, Notifiable;

    protected $table = 'agens';

    /**
     * Konstanta untuk jenis akun
     */
    const JENIS_AGENSI_BROKER = 'agensi_broker';
    const JENIS_AGENT_PERORANGAN = 'agent_perorangan';

    /**
     * List jenis akun dengan label
     */
    public static function jenisAkunOptions(): array
    {
        return [
            self::JENIS_AGENSI_BROKER => 'Agensi / Broker',
            self::JENIS_AGENT_PERORANGAN => 'Agent Perorangan',
        ];
    }

    protected $fillable = [
        // Existing fields
        'developer_id',
        'user_id',
        'name',
        'email',
        'password',
        'phone',
        'photo',
        'ktp',
        'license_number',
        'is_active',
        'sumber', // Tau dari mana (instagram, facebook, whatsapp, email, google, lainnya)

        // New fields - Jenis akun
        'jenis_akun',

        // Agensi/Broker fields
        'nama_agensi',
        'logo_agensi',
        'email_agensi',
        'website_agensi',

        // PIC (Person In Charge) fields - untuk agensi/broker
        'nama_pic',
        'foto_pic',
        'ktp_pic',
        'email_pic',
        'wa_pic',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    protected $attributes = [
        'jenis_akun' => self::JENIS_AGENT_PERORANGAN,
    ];

    // === Relationships ===

    public function developer()
    {
        return $this->belongsTo(Developer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function properties()
    {
        return $this->hasMany(Property::class);
    }

    public function credits()
    {
        return $this->hasMany(AgenCredit::class);
    }

    public function membershipTransactions()
    {
        return $this->hasMany(MembershipTransaction::class);
    }

    // === Credits ===

    public function activeCredits()
    {
        return $this->credits()->active();
    }

    public function getTotalRemainingHighlightAttribute(): int
    {
        return $this->activeCredits()->sum('remaining_highlight');
    }

    public function getTotalRemainingListingAttribute(): int
    {
        return $this->activeCredits()->sum('remaining_listing');
    }

    public function hasHighlightCredit(): bool
    {
        return $this->activeCredits()->where('remaining_highlight', '>', 0)->exists();
    }

    public function hasListingCredit(): bool
    {
        return $this->activeCredits()->where('remaining_listing', '>', 0)->exists();
    }

    // === Scopes ===

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAgensiBroker($query)
    {
        return $query->where('jenis_akun', self::JENIS_AGENSI_BROKER);
    }

    public function scopeAgentPerorangan($query)
    {
        return $query->where('jenis_akun', self::JENIS_AGENT_PERORANGAN);
    }

    // === Helper Methods ===

    /**
     * Check if agent is agensi/broker type
     */
    public function isAgensiBroker(): bool
    {
        return $this->jenis_akun === self::JENIS_AGENSI_BROKER;
    }

    /**
     * Check if agent is perorangan type
     */
    public function isAgentPerorangan(): bool
    {
        return $this->jenis_akun === self::JENIS_AGENT_PERORANGAN;
    }

    /**
     * Get display name (for agensi = nama_agensi, for perorangan = name)
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->isAgensiBroker() && $this->nama_agensi) {
            return $this->nama_agensi;
        }
        return $this->name ?? 'Agent';
    }

    /**
     * Get display photo (for agensi = logo_agensi, for perorangan = photo)
     */
    public function getDisplayPhotoAttribute(): ?string
    {
        if ($this->isAgensiBroker() && $this->logo_agensi) {
            return $this->logo_agensi;
        }
        return $this->photo ?? $this->foto_pic;
    }

    /**
     * Get contact email based on account type
     */
    public function getContactEmailAttribute(): string
    {
        if ($this->isAgensiBroker()) {
            return $this->email_agensi ?? $this->email_pic ?? $this->email;
        }
        return $this->email;
    }

    /**
     * Get contact phone based on account type
     */
    public function getContactPhoneAttribute(): string
    {
        if ($this->isAgensiBroker()) {
            return $this->wa_pic ?? $this->phone;
        }
        return $this->phone;
    }

    /**
     * Get jenis akun label
     */
    public function getJenisAkunLabelAttribute(): string
    {
        return self::jenisAkunOptions()[$this->jenis_akun] ?? $this->jenis_akun;
    }

    /**
     * Check if profile is complete based on account type
     */
    public function isProfileComplete(): bool
    {
        if ($this->isAgensiBroker()) {
            return !empty($this->nama_agensi)
                && !empty($this->nama_pic)
                && !empty($this->foto_pic)
                && !empty($this->ktp_pic)
                && !empty($this->email_pic)
                && !empty($this->wa_pic)
                && !empty($this->logo_agensi);
        }

        // Agent perorangan atau agent developer
        return !empty($this->photo) && !empty($this->ktp);
    }

    /**
     * Get WhatsApp link
     */
    public function getWhatsappLinkAttribute(): ?string
    {
        $number = $this->isAgensiBroker() ? ($this->wa_pic ?? $this->phone) : $this->phone;

        if ($number) {
            $number = preg_replace('/[^0-9]/', '', $number);
            if (substr($number, 0, 1) === '0') {
                $number = '62' . substr($number, 1);
            }
            return "https://wa.me/{$number}";
        }
        return null;
    }
}