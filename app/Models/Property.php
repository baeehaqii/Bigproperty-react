<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'city',
        "provinsi",
        'name',
        'units_remaining',
        'price_min',
        'price_max',
        'installment_start',
        'location',
        'bedrooms',
        'bathrooms',
        'carport',
        'listrik',
        'market_type',
        'construction_status',
        'land_size_min',
        'land_size_max',
        'building_size_min',
        'building_size_max',
        'certificate_type',
        'promo_text',
        'keunggulan',
        'images',
        'main_image',
        'button_type',
        'is_available',
        'is_popular',
        'is_verified',
        'has_promo',
        'tanpa_perantara',
        'last_updated',
        "event_id",
        "fasilitas",
        "url_maps",
        "nearest_place",
        "kategori",
        'developer_id',
        "count_clicked",
        "agen_id"
    ];

    protected $casts = [
        'nearest_place' => 'array',
        'kategori' => 'array',
        'keunggulan' => 'array',
        'fasilitas' => 'array',
        'images' => 'array',
        'price_min' => 'decimal:2',
        'price_max' => 'decimal:2',
        'installment_start' => 'decimal:2',
        'land_size_min' => 'integer',
        'land_size_max' => 'integer',
        'building_size_min' => 'integer',
        'building_size_max' => 'integer',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'carport' => 'integer',
        'listrik' => 'integer',
        'units_remaining' => 'integer',
        'is_available' => 'boolean',
        'is_popular' => 'boolean',
        'is_verified' => 'boolean',
        'has_promo' => 'boolean',
        'tanpa_perantara' => 'boolean',
        'last_updated' => 'datetime',

    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
    public function agen()
    {
        return $this->belongsTo(Agen::class);
    }
    public function developer()
    {
        return $this->belongsTo(Developer::class);
    }
    // Accessor untuk format harga
    public function getPriceRangeAttribute(): string
    {
        $formatPrice = function ($price) {
            if ($price >= 1000000000) {
                // Miliar
                $value = $price / 1000000000;
                return 'Rp ' . ($value == floor($value) ? number_format($value, 0) : number_format($value, 1, ',', '.')) . ' M';
            } else {
                // Juta
                $value = $price / 1000000;
                return 'Rp ' . ($value == floor($value) ? number_format($value, 0) : number_format($value, 1, ',', '.')) . ' Juta';
            }
        };

        if ($this->price_min == $this->price_max) {
            return $formatPrice($this->price_min);
        }
        return $formatPrice($this->price_min) . ' - ' . $formatPrice($this->price_max);
    }

    // Accessor untuk format cicilan
    public function getInstallmentTextAttribute(): string
    {
        $value = $this->installment_start / 1000000;
        $formatted = $value == floor($value) ? number_format($value, 0) : number_format($value, 1, ',', '.');
        return 'Angsuran mulai dari Rp' . $formatted . ' Jt/bln';
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