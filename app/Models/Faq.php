<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
class Faq extends Model
{
 use HasFactory, SoftDeletes;

    protected $fillable = [
        'question',
        'answer',
        'category',
        'display_order',
        'is_active',
        'views_count',
        'helpful_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'views_count' => 'integer',
        'helpful_count' => 'integer',
    ];
}
