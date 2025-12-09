<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\KreditUserController;
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
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/update/profile', [AuthController::class, 'updateProfile']);


    Route::post('/beli_membership', [KreditUserController::class, 'beliMembership']);
    Route::get('/kredit-user/{userId}', [KreditUserController::class, 'getKreditUser']);
    Route::get('/history-pembelian/{userId}', [KreditUserController::class, 'getHistoryPembelian']);
    Route::post('/upgrade_role/{userId}', [KreditUserController::class, 'upgradeRole']);
});
