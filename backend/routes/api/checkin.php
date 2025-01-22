<?php

use App\Http\Controllers\API\CheckInController;

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

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });
// Route::prefix('checkin')->group(function(){
//     Route::get('/{bookingTourId}/{userId}',[CheckInController::class,'getOne']);
//     Route::post('/{bookingTourId}',[CheckInController::class,'updateActivity']);
//     Route::post('cancel/{bookingTourId}',[CheckInController::class,'cancel']);
// });
// Route::apiResource('checkin',CheckInController::class);
// Route::get('get-all-statuses',[CheckInController::class,'getAllStatuses']);

Route::prefix('checkin')
->
// middleware([
//     'auth:sanctum',     
//     'permission:administration',
//     'permission:create booking',
//     'permission:view booking_checkout',
//     'permission:edit booking',
//     'permission:edit booking tour',
//     'permission:edit booking service',
//     'permission:booking activity'
// ])
middleware(['auth:sanctum', 'permission:admin|administration|create booking|view booking_checkout|edit booking|edit booking tour|edit booking service|booking activity|view booking'])
->group(function () {

        Route::post('store2',[CheckInController::class,'store2']);
        Route::put('update2/{id}',[CheckInController::class,'update2']);
        Route::get('/{bookingTourId}/{userId}',[CheckInController::class,'getOne']);
        Route::post('/{bookingTourId}',[CheckInController::class,'updateActivity']);
        Route::post('cancel/{bookingTourId}',[CheckInController::class,'cancel']);
});
// Route::get('get-all-statuses',[CheckInController::class,'getAllStatuses']);
Route::middleware(['auth:sanctum', 'permission:admin|administration|create booking|view booking_checkout|edit booking|edit booking tour|edit booking service|booking activity|view booking'])
// middleware([
//     'auth:sanctum', 
//     'permission:administration',
//     'permission:create booking',
//     'permission:view booking_checkout',
//     'permission:edit booking',
//     'permission:edit booking tour',
//     'permission:edit booking service',
//     'permission:booking activity'
// ])
->apiResource('checkin', CheckInController::class)->except(['create']);
