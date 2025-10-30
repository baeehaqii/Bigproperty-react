<?php

namespace App\Http\Controllers;

use App\Models\PropertyCategory;

class PropertyCategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'buy' => PropertyCategory::buy()->get(),
            'rent' => PropertyCategory::rent()->get(),
            'listing' => PropertyCategory::listing()->get(),
        ]);
    }
}
