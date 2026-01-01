<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Membership extends Model
{
    protected $fillable = [
        "nama",
        "jenis",
        "deskripsi",
        "harga",
        "jumlah_listing",
        "jumlah_highlight",
        "jumlah_agent",
        "popup_ads",
        "banner_ads",
    ];

    protected $casts = [
        'harga' => 'array',
        'jumlah_listing' => 'array',
        'jumlah_highlight' => 'array',
        'popup_ads' => 'array',
        'banner_ads' => 'array',
    ];

    // Helper method untuk format harga
    public function getFormattedHargaAttribute()
    {
        if (!$this->harga) return null;
        
        $amount = number_format($this->harga['amount'], 0, ',', '.');
        $duration = $this->harga['duration'];
        $period = match($this->harga['period']) {
            'day' => 'hari',
            'month' => 'bulan',
            'year' => 'tahun',
            default => ''
        };
        
        return "Rp {$amount}/{$duration} {$period}";
    }

    // Helper method untuk format listing
    public function getFormattedListingAttribute()
    {
        if (!$this->jumlah_listing) return null;
        
        $quantity = $this->jumlah_listing['quantity'];
        $duration = $this->jumlah_listing['duration'];
        $period = match($this->jumlah_listing['period']) {
            'day' => 'hari',
            'month' => 'bulan',
            'year' => 'tahun',
            default => ''
        };
        
        return "{$quantity} listing/{$duration} {$period}";
    }

    // Helper method untuk format highlight
    public function getFormattedHighlightAttribute()
    {
        if (!$this->jumlah_highlight) return null;
        
        $quantity = $this->jumlah_highlight['quantity'];
        $duration = $this->jumlah_highlight['duration'];
        $period = match($this->jumlah_highlight['period']) {
            'day' => 'hari',
            'month' => 'bulan',
            'year' => 'tahun',
            default => ''
        };
        
        return "{$quantity} listing/{$duration} {$period}";
    }

    // Helper method untuk format popup ads
    public function getFormattedPopupAdsAttribute()
    {
        if (!$this->popup_ads) return null;
        
        $duration = $this->popup_ads['duration'];
        $period = match($this->popup_ads['period']) {
            'day' => 'hari',
            'month' => 'bulan',
            'year' => 'tahun',
            default => ''
        };
        
        return "{$duration} {$period}";
    }

    // Helper method untuk format banner ads
    public function getFormattedBannerAdsAttribute()
    {
        if (!$this->banner_ads) return null;
        
        $duration = $this->banner_ads['duration'];
        $period = match($this->banner_ads['period']) {
            'day' => 'hari',
            'month' => 'bulan',
            'year' => 'tahun',
            default => ''
        };
        
        return "{$duration} {$period}";
    }
}