<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class FasilitasProperty extends Pivot
{
    protected $table = 'fasilitas_properties'; 
    
    public $timestamps = false;
    protected $fillable = [
        'property_id',
        'fasilitas_id',
    ];
}