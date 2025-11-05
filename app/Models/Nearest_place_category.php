<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nearest_place_category extends Model
{
    protected $table = "nearest_place_categories";
    protected $fillable = [
        "name",
    ];
}
