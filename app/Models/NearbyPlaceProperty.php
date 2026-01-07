<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NearbyPlaceProperty extends Model
{
    protected $table = 'nearby_place_properties';
    protected $fillable = [
        'property_id',
        'nearby_place_id',
        'jarak',
    ];

    public $timestamps = true;
}
