<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
class Feature extends Model
{
use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'subtitle',
        'description',
        'icon',
        'icon_type', // svg, image, icon-class
        'image',
        'link',
        'link_text',
        'display_order',
        'is_active',
        'category',
        'color_scheme',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
