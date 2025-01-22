<?php

use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\StaffController;
use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])
->apiResource('staffs', StaffController::class);

Route::middleware(['auth:sanctum'])->apiResource('customers', CustomerController::class);

Route::controller(CustomerController::class)
    ->group(function () {
        Route::post('searchPassPort', 'searchPassPort')->name('searchPassPort');
        Route::get('user/lock/{id}', 'lock')->name('user.lock');
        Route::get('user/unlock/{id}', 'unlock')->name('user.unlock');
    });

Route::middleware(['auth:sanctum'])->controller(StaffController::class)
->name('staff.')
->prefix('staff/')
->group(function () {
    Route::get('create', 'create')->name('create');
    Route::get('action/{bookingId}', 'getStaffsAction')->name('action');
    Route::post('changePassword', 'changePassword')->name('changePassword');
});
