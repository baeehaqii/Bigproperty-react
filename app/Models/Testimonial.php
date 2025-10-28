<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
class Testimonial extends Model
{
use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_name',
        'customer_title',
        'customer_company',
        'customer_photo',
        'content',
        'rating',
        'display_order',
        'is_featured',
        'is_active',
        'verified',
        'location',
        'testimonial_date',
        'source', // website, google, trustpilot, etc
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'verified' => 'boolean',
        'rating' => 'decimal:1',
        'testimonial_date' => 'date',
    ];
}
