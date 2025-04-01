<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CampoController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\API\AreaController;
use App\Http\Controllers\API\NivelCategoriaController;
use App\Http\Controllers\API\GradoController;
use App\Http\Controllers\API\CostoController;
use App\Http\Controllers\API\TutorController;
use App\Http\Controllers\API\CompetidorController;
use App\Http\Controllers\API\InscripcionController;
use App\Http\Controllers\API\PagoController;
use App\Http\Controllers\API\UsuarioController;
use App\Http\Controllers\API\RolController;
use App\Http\Controllers\API\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware([\App\Http\Middleware\CorsMiddleware::class])->group(function () {
    // Test endpoints
    Route::get('test-connection', function() {
        return response()->json([
            'status' => 'success',
            'message' => 'Conexión exitosa con el backend',
            'timestamp' => now()->toDateTimeString()
        ]);
    });

    Route::get('test-areas', function() {
        $areas = \App\Models\Area::all();
        return response()->json([
            'status' => 'success',
            'message' => 'Lista de áreas obtenida exitosamente',
            'data' => $areas
        ]);
    });

    // Public routes
    Route::post('login', [AuthController::class, 'login']);

    // Campos routes (de la rama mairon)
    Route::prefix('campos')->group(function () {
        Route::get('/', [CampoController::class, 'index']);
        Route::post('/update-config', [CampoController::class, 'updateConfig']);
    });
    
    // Registration routes (de la rama mairon)
    Route::prefix('registration')->group(function () {
        Route::get('/fields-config', [RegistrationController::class, 'getFieldsConfig']);
        Route::post('/submit', [RegistrationController::class, 'submitForm']);
    });

    // Protected routes (de la rama kevin)
    Route::middleware('auth:api')->group(function () {
        Route::get('user', [AuthController::class, 'user']);
        Route::post('logout', [AuthController::class, 'logout']);
        
        // Admin routes
        Route::apiResource('areas', AreaController::class);
        Route::apiResource('niveles', NivelCategoriaController::class);
        Route::apiResource('grados', GradoController::class);
        Route::apiResource('costos', CostoController::class);
        Route::apiResource('tutores', TutorController::class);
        Route::apiResource('competidores', CompetidorController::class);
        Route::get('/competidores/check', 'App\Http\Controllers\API\CompetidorController@checkExists');
        Route::apiResource('inscripciones', InscripcionController::class);
        Route::apiResource('pagos', PagoController::class);
        Route::apiResource('usuarios', UsuarioController::class);
        Route::apiResource('roles', RolController::class);
        
        // Dashboard data
        Route::get('dashboard/stats', [InscripcionController::class, 'getStats']);
    });
});