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

// Simulasi KPR Routes
Route::get('/simulasi-kpr/konvensional', function () {
    return Inertia::render('SimulasiKPR/KPRKonvensional');
})->name('simulasikpr.konvensional');

Route::get('/simulasi-kpr/syariah', function () {
    return Inertia::render('SimulasiKPR/KPRSyariah');
})->name('simulasikpr.syariah');


Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/property-categories', [PropertyCategoryController::class, 'index']);
Route::get('/property/{id}', [PropertyController::class, 'show'])->name('property.show');
Route::get('/api/property/{id}/similar', [PropertyController::class, 'getSimilarProperties'])->name('api.property.similar');
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
Route::get('/popular-properties/all', [PopularPropertyController::class, 'getAll']);
Route::get('/popular-properties', [PopularPropertyController::class, 'index']);
Route::get('/latest-properties', [PopularPropertyController::class, 'getLatest']);
Route::get('/verified-projects', [VerifiedProjectController::class, 'index']);

Route::get('/testimonials', [TestimoniController::class, 'index']);
Route::get('/testimonials/{id}', [TestimoniController::class, 'show']);

// Property Listing Routes (Beli / Sewa)
Route::get('/beli', [PropertyListingController::class, 'beli'])->name('listing.beli');
Route::get('/sewa', [PropertyListingController::class, 'sewa'])->name('listing.sewa');
Route::get('/api/property-filter-count', [PropertyListingController::class, 'getFilteredCount'])->name('api.property.filter-count');
Route::get('/api/property-search-suggestions', [PropertyListingController::class, 'searchSuggestions'])->name('api.property.search-suggestions');

// Leads API Route
use App\Http\Controllers\LeadsAgentController;
Route::post('/api/leads', [LeadsAgentController::class, 'store'])->name('api.leads.store');





// Agent Authentication Routes
use App\Http\Controllers\AgentAuthController;
use App\Http\Controllers\AgentDashboardController;
use App\Http\Controllers\AgentMembershipController;

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
        Route::post('/logout', [AgentAuthController::class, 'logout'])->name('logout');

        // Dashboard routes - using new folder structure
        Route::get('/dashboard', [AgentDashboardController::class, 'overview'])->name('dashboard');
        Route::get('/dashboard/listing-saya', [AgentDashboardController::class, 'listingSaya'])->name('dashboard.listing-saya');
        Route::delete('/dashboard/listing-saya/{id}', [AgentDashboardController::class, 'deleteListing'])->name('dashboard.delete-listing');
        Route::patch('/dashboard/listing-saya/{id}/status', [AgentDashboardController::class, 'updateListingStatus'])->name('dashboard.update-listing-status');
        Route::get('/dashboard/edit-listing/{id}', [AgentDashboardController::class, 'editListingForm'])->name('dashboard.edit-listing');
        Route::put('/dashboard/edit-listing/{id}', [AgentDashboardController::class, 'updateListing'])->name('dashboard.update-listing');
        Route::get('/dashboard/upload-listing', [AgentDashboardController::class, 'uploadListingForm'])->name('dashboard.upload-listing');
        Route::post('/dashboard/upload-listing', [AgentDashboardController::class, 'storeProperty'])->name('dashboard.store-property');
        Route::get('/dashboard/leads', [AgentDashboardController::class, 'leads'])->name('dashboard.leads');
        Route::get('/dashboard/report', [AgentDashboardController::class, 'report'])->name('dashboard.report');
        Route::get('/dashboard/beli-credit', [AgentDashboardController::class, 'beliCredit'])->name('dashboard.beli-credit');
        Route::get('/dashboard/history-credit', [AgentDashboardController::class, 'historyCredit'])->name('dashboard.history-credit');
        Route::get('/dashboard/profile', [AgentDashboardController::class, 'profileForm'])->name('dashboard.profile');
        Route::post('/dashboard/profile', [AgentDashboardController::class, 'updateProfile'])->name('dashboard.update-profile');
    });
});

// Agent Membership Payment API Routes (within web context using session auth)
Route::prefix('api/agent/membership')->middleware('auth:agent')->group(function () {
    Route::post('/checkout', [AgentMembershipController::class, 'checkout'])->name('api.agent.membership.checkout');
    Route::get('/status/{orderId}', [AgentMembershipController::class, 'status'])->name('api.agent.membership.status');
    Route::post('/retry/{orderId}', [AgentMembershipController::class, 'retryPayment'])->name('api.agent.membership.retry');
    Route::get('/my-credits', [AgentMembershipController::class, 'myCredits'])->name('api.agent.membership.my-credits');
});


// Wilayah API Routes
use App\Http\Controllers\Api\WilayahController;
Route::get('/api/wilayah/provinces', [WilayahController::class, 'provinces']);
Route::get('/api/wilayah/cities/{provinceCode}', [WilayahController::class, 'cities']);

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
