<?php

namespace App\Http\Controllers;

use App\Models\PropertyCategory;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Welcome', [
            'propertyCategories' => [
                'buy' => PropertyCategory::buy()->get(),
                'rent' => PropertyCategory::rent()->get(),
                'listing' => PropertyCategory::listing()->get(),
            ],
        ]);
    }
}