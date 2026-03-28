<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'fasilitas',
        'nearby_places',
        'kategori',
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
        "url_maps",
        'developer_id',
        "count_clicked",
        "agen_id",
        'jenis_air',
        'condition',
        'pajak',
        'notaris',
        'promo_list',
        'is_draft',
        'status_listing',
    ];

    protected $casts = [
        'promo_list' => 'array',
        'images' => 'array',
        'keunggulan' => 'array',
        'fasilitas' => 'array',
        'nearby_places' => 'array',
        'kategori' => 'array',
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
        'is_draft' => 'boolean',
        'last_updated' => 'datetime',
    ];


    public function fasilitas(): BelongsToMany
    {
        return $this->belongsToMany(Fasilitas::class, 'fasilitas_properties');
    }

    public function keunggulan(): BelongsToMany
    {
        return $this->belongsToMany(Keunggulan::class, 'keunggulan_properties');
    }

    public function NearbyPlace(): BelongsToMany
    {
        return $this->belongsToMany(NearbyPlace::class, 'nearby_place_properties')
            ->withPivot('jarak')
            ->withTimestamps();
    }

    public function nearbyPlacePivot(): HasMany
    {
        return $this->hasMany(NearbyPlaceProperty::class);
    }
    public function fasilitasPivot(): HasMany
    {
        return $this->hasMany(FasilitasProperty::class);
    }
    public function keunggulanPivot(): HasMany
    {
        return $this->hasMany(KeunggulanProperty::class);
    }
    public function promos(): BelongsToMany
    {
        return $this->belongsToMany(Promo::class, 'promo_property');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
    public function agen(): BelongsTo
    {
        return $this->belongsTo(Agen::class);
    }
    public function developer(): BelongsTo
    {
        return $this->belongsTo(Developer::class);
    }

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


    public function getInstallmentTextAttribute(): ?string
    {
        // Field is deprecated - installment_start is no longer used in forms
        if (!$this->installment_start || $this->installment_start <= 0) {
            return null;
        }
        $value = $this->installment_start / 1000000;
        $formatted = $value == floor($value) ? number_format($value, 0) : number_format($value, 1, ',', '.');
        return 'Angsuran mulai dari Rp' . $formatted . ' Jt/bln';
    }


    public function getLandSizeTextAttribute(): string
    {
        if ($this->land_size_min === $this->land_size_max) {
            return $this->land_size_min . 'm²';
        }
        return $this->land_size_min . '-' . $this->land_size_max . 'm²';
    }


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