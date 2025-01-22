<?php

use App\Http\Controllers\API\BookingTourServiceUserController;
use App\Http\Controllers\API\LoginController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::controller(LoginController::class)
    ->group(function () {
        Route::post('login', 'login')->name('login');
        Route::middleware(['auth:sanctum'])->post('logout', 'logout')->name('logout');
        Route::post('password/forgot',  'forgotPassword')->name('password.forgot');
        Route::post('password/reset', 'resetPassword')->name('password.reset');
    });
    Route::middleware(['auth:sanctum'])->get('all-status-servicer-user', [BookingTourServiceUserController::class,'create'])->name('all-status-servicer-user');