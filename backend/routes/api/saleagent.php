<?php

use App\Http\Controllers\API\SalesAgentController;
use App\Models\SaleAgent;
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
Route::prefix('sale-agents')->group(function(){
    Route::put('update-status/{id}', [SalesAgentController::class, 'updateTT']);
    Route::get('get-types/{type?}/{sort?}', [SalesAgentController::class, 'getTypes']);
    Route::get('create', [SalesAgentController::class, 'create2']);

});
Route::
middleware(['auth:sanctum', 'permission:admin|administration|view agent|view debt'])
// middleware([
//     'auth:sanctum', 
//     'permission:administration',
//      'permission:view agent',
//      'permission:view debt'
//  ])
 ->group(function () {
Route::apiResource('sale-agents',SalesAgentController::class);
 });

Route::controller( SalesAgentController::class)->name('saleAgent.')
->prefix('saleAgent/')
->group(function(){
    Route::get('create', 'create')->name('create');


});;
