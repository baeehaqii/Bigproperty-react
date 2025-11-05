<?php

namespace App\Http\Controllers;

use App\Models\PropertyCategory;

class PropertyCategoryController extends Controller
{
    public function index()
    {
        $categories = [
            'buy' => PropertyCategory::buy()->get(),
            'rent' => PropertyCategory::rent()->get(),
            'listing' => PropertyCategory::listing()->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}
