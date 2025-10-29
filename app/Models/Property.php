<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'developer_id',
        'city',
        'name',
        'type',
        'units_remaining',
        'price_min',
        'price_max',
        'installment_start',
        'location',
        'bedrooms',
        'land_size_min',
        'land_size_max',
        'building_size_min',
        'building_size_max',
        'certificate_type',
        'promo_text',
        'features',
        'images',
        'main_image',
        'button_type',
        'is_available',
        'is_popular',
        'last_updated',
    ];

    protected $casts = [
        'features' => 'array',
        'images' => 'array',
        'price_min' => 'decimal:2',
        'price_max' => 'decimal:2',
        'installment_start' => 'decimal:2',
        'land_size_min' => 'integer',
        'land_size_max' => 'integer',
        'building_size_min' => 'integer',
        'building_size_max' => 'integer',
        'units_remaining' => 'integer',
        'is_available' => 'boolean',
        'is_popular' => 'boolean',
        'last_updated' => 'datetime',
    ];

    public function developer(): BelongsTo
    {
        return $this->belongsTo(Developer::class);
    }

    // Accessor untuk format harga
    public function getPriceRangeAttribute(): string
    {
        if ($this->price_min === $this->price_max) {
            return 'Rp ' . number_format($this->price_min / 1000000, 1, ',', '.') . ' Jt';
        }
        return 'Rp ' . number_format($this->price_min / 1000000, 1, ',', '.') . ' Jt - Rp ' . 
               number_format($this->price_max / 1000000, 1, ',', '.') . ($this->price_max >= 1000000000 ? ' M' : ' Jt');
    }

    // Accessor untuk format cicilan
    public function getInstallmentTextAttribute(): string
    {
        return 'Angsuran mulai dari Rp' . number_format($this->installment_start / 1000000, 1, ',', '.') . ' Jt/bln';
    }

    // Accessor untuk ukuran tanah
    public function getLandSizeTextAttribute(): string
    {
        if ($this->land_size_min === $this->land_size_max) {
            return $this->land_size_min . 'm²';
        }
        return $this->land_size_min . '-' . $this->land_size_max . 'm²';
    }

    // Accessor untuk ukuran bangunan
    public function getBuildingSizeTextAttribute(): string
    {
        if (!$this->building_size_max) {
            return $this->building_size_min . '-';
        }
        if ($this->building_size_min === $this->building_size_max) {
            return $this->building_size_min . 'm²';
        }
        return $this->building_size_min . '-' . $this->building_size_max . 'm²';
    }
}