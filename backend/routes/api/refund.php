<?php

use App\Http\Controllers\API\RefundController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'permission:refund'])->apiResource('refunds', RefundController::class);