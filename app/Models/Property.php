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
        'city', 'provinsi', 'name', 'units_remaining', 'price_min', 'price_max',
        'installment_start', 'location', 'bedrooms', 'land_size_min', 'land_size_max',
        'building_size_min', 'building_size_max', 'certificate_type', 'promo_text',
        'images', 'main_image', 'button_type', 'is_available', 'is_popular',
        'last_updated', 'event_id', 'url_maps', 'kategori', 'developer_id',
        'count_clicked', 'agen_id'
    ];

    protected $casts = [
        'kategori' => 'array',
        'images' => 'array',
        'price_min' => 'decimal:2',
        'price_max' => 'decimal:2',
        'installment_start' => 'decimal:2',
        'is_available' => 'boolean',
        'is_popular' => 'boolean',
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
    
    public function event(): BelongsTo { return $this->belongsTo(Event::class); }
    public function agen(): BelongsTo { return $this->belongsTo(Agen::class); }
    public function developer(): BelongsTo { return $this->belongsTo(Developer::class); }
    
    public function getPriceRangeAttribute(): string
    {
        if ($this->price_min === $this->price_max) {
            return 'Rp ' . number_format($this->price_min / 1000000, 1, ',', '.') . ' Jt';
        }
        return 'Rp ' . number_format($this->price_min / 1000000, 1, ',', '.') . ' Jt - Rp ' . 
               number_format($this->price_max / 1000000, 1, ',', '.') . ($this->price_max >= 1000000000 ? ' M' : ' Jt');
    }

    
    public function getInstallmentTextAttribute(): string
    {
        return 'Angsuran mulai dari Rp' . number_format($this->installment_start / 1000000, 1, ',', '.') . ' Jt/bln';
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