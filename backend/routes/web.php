<?php

use App\Http\Controllers\API\hi;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\UserController;
use App\Models\Branch;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/
Route::get('/', function () {
    echo "haha";
});

Route::controller(UserController::class)
->group(function(){
    Route::get('login', 'showLogin')->name('login');
    Route::post('login', 'Login')->name('login');
    Route::post('logout', 'logout')->name('logout');
    Route::get('user', 'index')->name('user');
    Route::middleware('role:admin')->name('staffs.')
    ->prefix('staff/')->group(function(){
        Route::get('/', 'index')->name('index');
        Route::get('detail/{id}', 'detail')->name('detail');
        Route::get('create', 'create')->name('create');
        Route::post('store', 'store')->name('store');
        Route::get('edit/{id}', 'edit')->name('edit');
        Route::put('update/{id}', 'update')->name('update');
        Route::put('lock/{id}', 'lock')->name('lock');
        Route::put('unlock/{id}', 'unLock')->name('unlock');
    });
});

Route::controller(BranchController::class)
->name('branches.')
->prefix('branches/')
->middleware('permission:view branch')
->group(function(){
    Route::get('/', 'index')->name('index');
    Route::get('create', 'create')->name('create')->middleware('role:admin');
    Route::post('store', 'store')->name('store')->middleware('role:admin');
    Route::get('edit/{id}', 'edit')->name('edit')->middleware('role:admin');
    Route::put('update/{id}', 'update')->name('update')->middleware('role:admin');
    Route::delete('delete/{id}', 'destroy')->name('delete')->middleware('role:admin');
});


