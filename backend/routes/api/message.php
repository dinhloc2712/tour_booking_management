<?php

use App\Http\Controllers\API\ConversationController;
use App\Http\Controllers\API\MessageController;
use Illuminate\Support\Facades\Route;

Route::apiResource('conversations',ConversationController::class)
->middleware(['auth:sanctum']);

Route::controller(MessageController::class)
->name('messages.')
->prefix('messages/')
->group(function(){
    Route::get('{conversationId}', 'index');
    Route::post('{conversationId}', 'store');
});
