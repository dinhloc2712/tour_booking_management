<?php

use App\Http\Controllers\API\BillController;
use Illuminate\Support\Facades\Route;


Route::apiResource('bills', BillController::class);

Route::controller(BillController::class)
->name('bill.')
->prefix('bill/')
->group(function(){
    Route::post('create', 'create')->name('create');
    Route::get('booking/{id}', 'getBillBooking')->name('booking');
    Route::get('createDeposit/{bookingId}', 'createDeposit')->name('createDeposit');
    Route::get('bookingTour/{bookingTourId}', 'getBillBookingTour')->name('bookingTour');
    Route::get('createRefundBooking/{bookingId}', 'createRefundBooking')->name('createRefundBooking');
});
