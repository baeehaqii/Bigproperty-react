<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KeunggulanProperty extends Model
{
    protected $table = 'keunggulan_properties';

    public $timestamps = false;

    // Tambahkan ini biar Filament bisa nge-save data dari repeater
    protected $fillable = [
        'property_id',
        'keunggulan_id',
    ];
}