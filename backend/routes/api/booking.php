<?php

use App\Http\Controllers\API\BookingController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
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

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     echo "haha";

//     Auth::check();
//     return $request->user()->hasRole(['admin','admin_branch', 'sale']);

// });


//     Route::prefix('bookings')->group(function(){
//         Route::get('create',[BookingController::class,'create']);
//         Route::post('cancel/{bookingTourId}/{userId}',[BookingController::class,'cancel']);
//     });


// Route::apiResource('bookings',BookingController::class);

Route::middleware(['auth:sanctum', 'permission:admin|administration|create booking|view booking_checkout|edit booking|edit booking tour|edit booking service|booking activity|view booking'])->group(function () {

    Route::get('get-one-user/{id}/{status?}', [BookingController::class, 'getOneUser']);
    Route::get('get-one-booking-user/{id}', [BookingController::class, 'getOneBookingUser']);
    Route::get('create', [BookingController::class, 'create']);
    Route::post('cancel/{id}', [BookingController::class, 'cancel']);
});
    Route::middleware([
        'auth:sanctum',
        'permission:administration|
        create booking|
        view booking_checkout|
        edit booking|
         edit booking tour|
         edit booking service|
         booking activity|view booking',

     ])->apiResource('bookings', BookingController::class)->except(['create']);
    // Route::middleware(['auth:sanctum', 'permission:admin|administration|create booking|view booking_checkout|edit booking|edit booking tour|edit booking service|booking activity|view booking'])
    // ->apiResource('bookings', BookingController::class)
    // ->except(['create']);
