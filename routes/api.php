<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\KreditUserController;
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\Api\MembershipPaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// KREDIT USER  

Route::middleware('auth')->group(function () {
    Route::post('/kredit-new-user', [App\Http\Controllers\KreditUserController::class, 'store']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Midtrans Webhook (tidak perlu auth)
Route::post('/midtrans/webhook', [MidtransWebhookController::class, 'handle']);

// Membership Payment API (public - untuk ambil paket)
Route::get('/memberships/packages', [MembershipPaymentController::class, 'packages']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/update/profile', [AuthController::class, 'updateProfile']);


    Route::post('/beli_membership', [KreditUserController::class, 'beliMembership']);
    Route::get('/kredit-user/{userId}', [KreditUserController::class, 'getKreditUser']);
    Route::get('/history-pembelian/{userId}', [KreditUserController::class, 'getHistoryPembelian']);
    Route::post('/upgrade_role/{userId}', [KreditUserController::class, 'upgradeRole']);

    // Membership Payment API (perlu auth)
    Route::prefix('membership-payment')->group(function () {
        Route::post('/checkout', [MembershipPaymentController::class, 'checkout']);
        Route::get('/status/{orderId}', [MembershipPaymentController::class, 'status']);
        Route::post('/retry/{orderId}', [MembershipPaymentController::class, 'retryPayment']);
        Route::get('/my-credits', [MembershipPaymentController::class, 'myCredits']);
    });
});
