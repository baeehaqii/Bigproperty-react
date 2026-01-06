<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Fasilitas extends Model
{
    protected $fillable = ['nama', 'icon'];

    public function properties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'fasilitas_properties');
    }
}