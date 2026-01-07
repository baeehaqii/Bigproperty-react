<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class NearbyPlace extends Model
{
    protected $fillable = ['nama', 'kategori'];

    public function properties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'nearby_place_properties');
    }
}