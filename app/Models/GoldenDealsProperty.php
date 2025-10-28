<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoldenDealsProperty extends Model
{
    use HasFactory;

    protected $fillable = [
        'image',
        'type',
        'badge',
        'type_extra',
        'price_min',
        'price_max',
        'price_range',
        'installment_amount',
        'installment_text',
        'property_name',
        'developer_id',
        'location_district',
        'location_city',
        'bedrooms',
        'land_size',
        'building_size',
        'has_shm',
        'status',
    ];

    protected $casts = [
        'price_min' => 'decimal:2',
        'price_max' => 'decimal:2',
        'installment_amount' => 'decimal:2',
        'has_shm' => 'boolean',
    ];

    // Relationship dengan Developer
    public function developer(): BelongsTo
    {
        return $this->belongsTo(Developer::class);
    }

    // Accessor untuk format harga
    public function getPriceRangeFormattedAttribute(): string
    {
        return $this->price_range ?? "Rp " . number_format($this->price_min / 1000000, 1) . " M - Rp " . number_format($this->price_max / 1000000, 1) . " M";
    }

    // Accessor untuk angsuran
    public function getInstallmentFormattedAttribute(): string
    {
        return $this->installment_text ?? "Angsuran mulai dari Rp" . number_format($this->installment_amount / 1000000, 1) . " Jt/bln";
    }

    // Accessor untuk lokasi lengkap
    public function getLocationFullAttribute(): string
    {
        return $this->location_district . ', ' . $this->location_city;
    }

    // Scope untuk filter berdasarkan tipe
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Scope untuk filter berdasarkan harga
    public function scopeByPriceRange($query, ?float $min = null, ?float $max = null)
    {
        if ($min) {
            $query->where('price_min', '>=', $min);
        }
        if ($max) {
            $query->where('price_max', '<=', $max);
        }
        return $query;
    }

    // Scope untuk properti aktif
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}