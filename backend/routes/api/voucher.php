<?php

use App\Http\Controllers\API\VoucherController;
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

Route::apiResource('vouchers', VoucherController::class);

Route::controller( VoucherController::class)->name('voucher.')
->prefix('voucher/')
->group(function(){
    Route::get('type-voucher', 'type_voucher')->name('type-voucher');
    Route::get('object-type-voucher', 'object_type_voucher')->name('object-type-voucher');
});;
Route::post('/check-voucher-tour', [VoucherController::class, 'checkVoucherTour']);
Route::post('/check-voucher-customer', [VoucherController::class, 'checkVoucherCustomer']);


