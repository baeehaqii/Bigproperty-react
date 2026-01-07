<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    protected $fillable = ['nama', 'slug', 'deskripsi', 'is_active'];

    public function properties()
    {
        return $this->belongsToMany(Property::class, 'promo_property');
    }
}
