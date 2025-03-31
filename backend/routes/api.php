<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CampoController;
use App\Http\Controllers\RegistrationController;

Route::middleware([\App\Http\Middleware\CorsMiddleware::class])->group(function () {
    Route::prefix('campos')->group(function () {
        Route::get('/', [CampoController::class, 'index']);
        Route::post('/update-config', [CampoController::class, 'updateConfig']);
    });
    
    Route::prefix('registration')->group(function () {
        Route::get('/fields-config', [RegistrationController::class, 'getFieldsConfig']);
        Route::post('/submit', [RegistrationController::class, 'submitForm']);
    });
});