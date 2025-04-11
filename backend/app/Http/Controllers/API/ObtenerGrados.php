<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class GradoController extends Controller
{
    /**
     * Obtener todos los grados disponibles, ordenados por jerarquía
     */
    public function obtenerGrados(): JsonResponse
    {
        $grados = DB::table('grados')
            ->select('id_grado', 'nombre_grado')
            ->orderBy('orden')
            ->get();

        return response()->json(['grados' => $grados], 200);
    }
}
