<?php

use App\Http\Controllers\PropertyCategoryController;
use App\Models\PropertyCategory;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/property/{id}', function ($id) {
    return Inertia::render('PropertyDetail', [
        'property' => [
            'id' => $id,
            'name' => 'Test Property ' . $id,
            'type' => 'Rumah',
            'status' => 'Available',
            'price' => [
                'min' => 500000000,
                'max' => 800000000,
                'currency' => 'IDR'
            ],
            'images' => [
                ['url' => 'https://via.placeholder.com/600x400', 'alt' => 'Test Property', 'priority' => 1]
            ],
            'specifications' => [
                'bedrooms' => '2-3 BR',
                'bathrooms' => '1-2',
                'landArea' => '60-90m²',
                'buildingArea' => '45-70m²',
                'certificateType' => 'SHM'
            ],
            'installment' => [
                'monthly' => 'Angsuran mulai dari Rp5Jt/bln',
            ],
            'developer' => [
                'name' => 'Test Developer',
                'logo' => 'https://via.placeholder.com/40',
            ],
            'location' => [
                'district' => 'Legok',
                'subDistrict' => 'Legok',
                'city' => 'Tangerang',
                'province' => 'Banten',
            ],
            'description' => 'Test property dengan lokasi strategis.',
            'remainingUnits' => 10
        ]
    ]);
})->name('property.show');


Route::middleware([
    'auth',
    ValidateSessionWithWorkOS::class,
])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/property-categories', [PropertyCategoryController::class, 'index']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
