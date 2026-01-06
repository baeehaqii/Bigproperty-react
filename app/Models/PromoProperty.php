<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoProperty extends Model
{
    protected $table = 'promo_properties'; 
    
    public $timestamps = false;
    protected $fillable = [
        'property_id',
        'promo_id',
    ];
}
