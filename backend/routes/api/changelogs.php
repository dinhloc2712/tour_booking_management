<?php

use App\Http\Controllers\API\ChangeLogController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

// prefix('change-logs')->
Route::middleware([
   'auth:sanctum', 
   'permission:administration',
    
])->group(function () {
Route::get('all-log-model/{model?}', [ChangeLogController::class, 'getAllLogModel']);
    
});
    Route::middleware([
        'auth:sanctum', 
        'permission:administration',
         
     ])->apiResource('change-logs', ChangeLogController::class)->except(['create']);



