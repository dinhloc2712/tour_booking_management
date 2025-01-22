<?php

use App\Http\Controllers\API\BookingTourController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
Route::prefix('booking-tours')->middleware(['auth:sanctum', 'permission:admin|administration|create booking|view booking_checkout|edit booking|edit booking tour|edit booking service|booking activity|view booking'])
->group(function () {
Route::post('cancel/{id}', [BookingTourController::class, 'cancel'])->where('id', '[0-9]+');

 });
Route::get('get-one-booking-tours-all-users/{id}', [BookingTourController::class, 'getOneBookingTourAllUsers'])->where('id', '[0-9]+');
Route::get('booking-tours', [BookingTourController::class, 'index']);
// Route::get('booking-tours/{status?}/', [BookingTourController::class, 'index'])->where('status', '[a-zA-Z]+');;
Route::get('booking-tours/{id}', [BookingTourController::class, 'show'])->where('id', '[0-9]+');
Route::apiResource('booking-tours', BookingTourController::class)->except(['index','show']);