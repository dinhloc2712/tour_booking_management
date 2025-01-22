<?php

use App\Http\Controllers\API\ServiceController;

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

Route::
middleware(['auth:sanctum'])->apiResource('services', ServiceController::class);

Route::controller( ServiceController::class)->name('service.')
->prefix('service/')
->group(function(){
    Route::get('create', 'create')->name('create');
});;

Route::get('serviceTour', [ServiceController::class, 'serviceTour']);

Route::prefix('services')->group(function(){
    Route::put('update-status/{id}', [ServiceController::class, 'updateTT']);
});
