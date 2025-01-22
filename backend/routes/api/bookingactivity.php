<?php

use App\Http\Controllers\API\BookingActivityController;
use App\Http\Controllers\API\BookingController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

Route::get('get-all-statuses',[BookingActivityController::class,'getAllStatuses']);
Route::post('booking-activities/{bookingTourId}',[BookingActivityController::class,'updateActivity']);

