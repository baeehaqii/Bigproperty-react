<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
class Partner extends Model
{
use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'logo',
        'logo_dark', // untuk dark mode
        'website_url',
        'description',
        'category', // client, partner, investor, media
        'display_order',
        'is_featured',
        'is_active',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];
}
