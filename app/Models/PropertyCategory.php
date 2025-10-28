<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PropertyCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'section',
        'is_highlighted',
        'has_badge',
        'badge_text',
        'badge_color',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_highlighted' => 'boolean',
        'has_badge' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    public function scopeBuy($query)
    {
        return $query->where('section', 'buy')->where('is_active', true)->orderBy('order');
    }

    public function scopeRent($query)
    {
        return $query->where('section', 'rent')->where('is_active', true)->orderBy('order');
    }

    public function scopeListing($query)
    {
        return $query->where('section', 'listing')->where('is_active', true)->orderBy('order');
    }

    public function getSectionLabelAttribute(): string
    {
        return match($this->section) {
            'buy' => 'Beli Properti',
            'rent' => 'Sewa Properti',
            'listing' => 'Titip Jual & Sewa',
            default => $this->section,
        };
    }
}