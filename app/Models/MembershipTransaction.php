<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipTransaction extends Model
{
    protected $fillable = [
        'agen_id',
        'membership_id',
        'order_id',
        'gross_amount',
        'status',
        'payment_type',
        'snap_token',
        'payload_midtrans',
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'payload_midtrans' => 'array',
    ];

    /**
     * Status yang tidak boleh di-update (Immutability)
     */
    public const IMMUTABLE_STATUSES = ['settlement', 'expire', 'cancel'];

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
     * Cek apakah transaksi sudah immutable
     */
    public function isImmutable(): bool
    {
        return in_array($this->status, self::IMMUTABLE_STATUSES);
    }

    /**
     * Scope untuk transaksi pending
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope untuk transaksi settlement
     */
    public function scopeSettlement($query)
    {
        return $query->where('status', 'settlement');
    }

    /**
     * Generate order_id unik
     * Format: INV-HGL-{timestamp}-{random}
     */
    public static function generateOrderId(): string
    {
        $timestamp = now()->format('YmdHis');
        $random = strtoupper(substr(uniqid(), -4));
        return "INV-HGL-{$timestamp}-{$random}";
    }
}
