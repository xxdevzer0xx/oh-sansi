<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ObtenerMaterias;
use App\Http\Controllers\API\AreaController;
use App\Http\Controllers\API\CostoController;
use App\Http\Controllers\API\TutorController;
use App\Http\Controllers\API\CompetidorController;
use App\Http\Controllers\API\PagoController;
use App\Http\Controllers\API\UsuarioController;
use App\Http\Controllers\API\RolController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\Api\AreasCompetenciaController;
use App\Http\Controllers\Api\ConvocatoriaController;
use App\Http\Controllers\Api\EstudianteController;
use App\Http\Controllers\Api\UnidadEducativaController;
use App\Http\Controllers\Api\GradoController;
use App\Http\Controllers\Api\NivelCategoriaController;
use App\Http\Controllers\Api\TutorLegalController;
use App\Http\Controllers\Api\TutorAcademicoController;
use App\Http\Controllers\Api\ListaInscripcionController;
use App\Http\Controllers\Api\OrdenPagoController;
use App\Http\Controllers\Api\ComprobantePagoController;
use App\Http\Controllers\Api\ConvocatoriaAreaController;
use App\Http\Controllers\Api\ConvocatoriaNivelController;
use App\Http\Controllers\Api\PublicConvocatoriaController;
use App\Http\Controllers\Api\InscripcionDatosController;
use App\Http\Controllers\Api\InscripcionCompletaController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\ConvocatoriaCompletaController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/





Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// API v1 Routes
Route::prefix('v1')->group(function () {
    // Areas de Competencia
    Route::get('/obtener-materias', [ObtenerMaterias::class, 'obtenerMaterias']);
    Route::apiResource('areas', AreasCompetenciaController::class);
    
    // Convocatorias
    Route::apiResource('convocatorias', ConvocatoriaController::class);
    
    // Áreas de Convocatoria
    Route::apiResource('convocatoria-areas', ConvocatoriaAreaController::class);
    
    // Niveles de Convocatoria
    Route::apiResource('convocatoria-niveles', ConvocatoriaNivelController::class);
    
    // Estudiantes
    Route::apiResource('estudiantes', EstudianteController::class);
    Route::get('estudiantes/search', [EstudianteController::class, 'search']);
    
    // Inscripciones
    Route::apiResource('inscripciones', InscripcionController::class);
    
    // Dashboard data
    Route::get('dashboard/stats', [InscripcionController::class, 'getStats']);

    // Unidades Educativas
    Route::apiResource('unidades-educativas', UnidadEducativaController::class);
    
    // Grados
    Route::apiResource('grados', GradoController::class);
    
    // Niveles de Categoría
    Route::apiResource('niveles', NivelCategoriaController::class);
    
    // Tutores Legales
    Route::apiResource('tutores-legales', TutorLegalController::class);
    
    // Tutores Académicos
    Route::apiResource('tutores-academicos', TutorAcademicoController::class);
    
    // Listas de Inscripción
    Route::apiResource('listas-inscripcion', ListaInscripcionController::class);
    Route::post('listas-inscripcion/{id}/detalles', [ListaInscripcionController::class, 'addDetail']);
    Route::delete('listas-inscripcion/{id}/detalles/{detalleId}', [ListaInscripcionController::class, 'removeDetail']);
    
    // Órdenes de Pago
    Route::apiResource('ordenes-pago', OrdenPagoController::class);
    Route::get('ordenes-pago/buscar-por-codigo', [OrdenPagoController::class, 'getByCode']);
    
    // Comprobantes de Pago
    Route::apiResource('comprobantes-pago', ComprobantePagoController::class);
    Route::get('comprobantes-pago/{id}/download', [ComprobantePagoController::class, 'downloadPdf']);
    
    // Nuevos endpoints orientados a páginas/casos de uso
    
    // Endpoint para página Home
    Route::get('/public/convocatoria-actual', [PublicConvocatoriaController::class, 'getConvocatoriaActual']);
    
    // Endpoints para página de Inscripción
    Route::get('/public/datos-inscripcion', [InscripcionDatosController::class, 'getDatosInscripcion']);
    Route::get('/public/unidades-educativas/buscar', [InscripcionDatosController::class, 'buscarUnidadesEducativas']);
    Route::post('/public/inscripcion-completa', [InscripcionCompletaController::class, 'inscribirEstudiante']);
    
    // Endpoints para página de Administración
    Route::get('/admin/dashboard-data', [AdminDashboardController::class, 'getDashboardData']);
    Route::post('/admin/convocatorias/completa', [ConvocatoriaCompletaController::class, 'crearConvocatoriaCompleta']);
    Route::get('/admin/convocatorias/{id}/completa', [ConvocatoriaCompletaController::class, 'getConvocatoriaCompleta']);
});