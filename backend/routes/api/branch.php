<?php

use App\Http\Controllers\API\BranchController;
use Illuminate\Support\Facades\Route;


Route::
middleware(['auth:sanctum', 'role:admin'])->
apiResource('branches', BranchController::class);

Route::controller(BranchController::class)
->name('branch.')
->prefix('branch/')
->group(function (){
    Route::get('create', 'create')->name('create');
});