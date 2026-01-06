<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Keunggulan extends Model
{
    protected $fillable = ['nama', 'icon', 'keterangan'];

    public function properties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'keunggulan_properties');
    }
}