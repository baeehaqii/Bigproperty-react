<?php

use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\PopularPropertyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HeroController;
use App\Http\Controllers\PropertyCategoryController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\PropertyListingController;
use App\Http\Controllers\TestimoniController;
use App\Http\Controllers\VerifiedProjectController;
use App\Models\Hero;
use App\Models\PropertyCategory;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/property-categories', [PropertyCategoryController::class, 'index']);
Route::get('/property/{id}', [PropertyController::class, 'show'])->name('property.show');
Route::get('/property-test/{id}', function ($id) {
    $property = \App\Models\Property::findOrFail($id);
    return Inertia::render('PropertyDetailTest', ['property' => $property]);
});
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

// Property Listing Routes (Beli / Sewa)
Route::get('/beli', [PropertyListingController::class, 'beli'])->name('listing.beli');
Route::get('/sewa', [PropertyListingController::class, 'sewa'])->name('listing.sewa');
Route::get('/api/property-filter-count', [PropertyListingController::class, 'getFilteredCount'])->name('api.property.filter-count');
Route::get('/api/property-search-suggestions', [PropertyListingController::class, 'searchSuggestions'])->name('api.property.search-suggestions');





// Agent Authentication Routes
use App\Http\Controllers\AgentAuthController;

Route::prefix('agent')->name('agent.')->group(function () {
    // Guest routes untuk agent - hanya yang belum login sebagai agent
    Route::middleware('guest:agent')->group(function () {
        Route::get('/register', [AgentAuthController::class, 'showSignupForm'])->name('register');
        Route::post('/register', [AgentAuthController::class, 'register']);
        Route::get('/login', [AgentAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [AgentAuthController::class, 'login']);
    });

    // Agent authenticated routes - hanya yang sudah login sebagai agent
    Route::middleware('auth:agent')->group(function () {
        Route::get('/dashboard', [AgentAuthController::class, 'dashboard'])->name('dashboard');
        Route::post('/logout', [AgentAuthController::class, 'logout'])->name('logout');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
