<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        "is_active",
    ];
    public function properties()
    {
        return $this->hasMany(Property::class);
    }
}
