<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Developer extends Model
{

    protected $fillable = [
        'name', 
        "pt",
        'alamat',
        'logo', 
        'list_property',
    ];
    
    protected $casts = [
        'list_property' => 'array',
    ];
}