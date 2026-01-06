<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class AgenCredit extends Model
{
    protected $fillable = [
        'agen_id',
        'membership_id',
        'remaining_listing',
        'remaining_highlight',
        'remaining_agent_slots',
        'expired_at',
        'is_active',
    ];

    protected $casts = [
        'remaining_listing' => 'integer',
        'remaining_highlight' => 'integer',
        'remaining_agent_slots' => 'integer',
        'expired_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Relasi ke Agen
     */
    public function agen(): BelongsTo
    {
        return $this->belongsTo(Agen::class);
    }

    /**
     * Relasi ke Membership
     */
    public function membership(): BelongsTo
    {
        return $this->belongsTo(Membership::class);
    }

    /**
     * Scope untuk credit yang masih aktif dan belum expired
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where('expired_at', '>', now());
    }

    /**
     * Scope untuk credit yang sudah expired
     */
    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('expired_at', '<=', now());
    }

    /**
     * Cek apakah credit masih valid
     */
    public function isValid(): bool
    {
        return $this->is_active && $this->expired_at > now();
    }

    /**
     * Cek apakah masih punya sisa highlight
     */
    public function hasHighlightCredit(): bool
    {
        return $this->isValid() && $this->remaining_highlight > 0;
    }

    /**
     * Cek apakah masih punya sisa listing
     */
    public function hasListingCredit(): bool
    {
        return $this->isValid() && $this->remaining_listing > 0;
    }

    /**
     * Konsumsi highlight credit
     */
    public function consumeHighlight(int $amount = 1): bool
    {
        if ($this->remaining_highlight >= $amount && $this->isValid()) {
            $this->decrement('remaining_highlight', $amount);
            return true;
        }
        return false;
    }

    /**
     * Konsumsi listing credit
     */
    public function consumeListing(int $amount = 1): bool
    {
        if ($this->remaining_listing >= $amount && $this->isValid()) {
            $this->decrement('remaining_listing', $amount);
            return true;
        }
        return false;
    }
}
