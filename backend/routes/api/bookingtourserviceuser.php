<?php


use App\Http\Controllers\API\BookingTourServiceUserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

Route::middleware(['auth:sanctum', 'permission:admin|administration|edit booking service'])
->group(function () {
    Route::apiResource('booking-tour-service-users', BookingTourServiceUserController::class);
    Route::get('recommended-services/{bookingTourId}/{userId}', [BookingTourServiceUserController::class, 'suggestServices']);
    Route::get('recommended-services2/{TourId}/{userId?}', [BookingTourServiceUserController::class, 'suggestServices2']);

 });
