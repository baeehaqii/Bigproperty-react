<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Hero extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'heroes';

    protected $fillable = [
        'title',
        'subtitle',
        "deskripsi",
        'image',
        'is_active',
        'link_url',
        'link_text',
        "main_color"
    ];

    protected $casts = [
        'image'=> 'array',
        'is_active' => 'boolean',
    ];

    // Scope untuk ambil hero yang aktif aja
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}