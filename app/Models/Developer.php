<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Developer extends Model
{
    protected $fillable = ['name', 'logo'];

    public function properties()
    {
        return $this->hasMany(GoldenDealsProperty::class);
    }
}