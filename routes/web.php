<?php

use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\PopularPropertyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HeroController;
use App\Http\Controllers\PropertyCategoryController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\TestimoniController;
use App\Http\Controllers\VerifiedProjectController;
use App\Models\Hero;
use App\Models\PropertyCategory;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware([
    'auth',
    ValidateSessionWithWorkOS::class,
])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/property-categories', [PropertyCategoryController::class, 'index']);
Route::get('/property/{id}', [PropertyController::class, 'show'])->name('property.show');
// route untuk yang menampilkan gambar hero dari storage lokal
Route::get('/storage/hero/images/{filename}', function ($filename) {
    $path = 'hero/images/' . $filename;
    
    if (!Storage::disk('local')->exists($path)) {
        abort(404);
    }
    
    $file = Storage::disk('local')->get($path);
    $type = Storage::disk('local')->mimeType($path);
    
    return response($file, 200)->header('Content-Type', $type);
})->where('filename', '.*');

Route::get('/golden-deals', [EventController::class, 'index']);
Route::get('/heroes-data', [HeroController::class, 'index']);

// route untk menampilkan gambar dari storage private
Route::get('/storage/private/{path}', function ($path) {
    $fullPath = storage_path('app/private/' . $path);
    
    if (!file_exists($fullPath)) {
        abort(404);
    }
    
    return response()->file($fullPath);
})->where('path', '.*');

Route::get('/popular-properties/cities', [PopularPropertyController::class, 'getCities']);
Route::get('/popular-properties/city/{city}', [PopularPropertyController::class, 'getByCity']);
Route::get('/popular-properties', [PopularPropertyController::class, 'index']);
Route::get('/verified-projects', [VerifiedProjectController::class, 'index']);

Route::get('/testimonials', [TestimoniController::class, 'index']);
Route::get('/testimonials/{id}', [TestimoniController::class, 'show']);









require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
