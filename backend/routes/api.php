<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InscripcionController;

Route::prefix('v1')->group(function () {
    // Inscripción
    Route::post('/inscripciones', [InscripcionController::class, 'inscribir']);
    
    // Consultas públicas
    Route::get('/areas', [InscripcionController::class, 'getAreas']);
});