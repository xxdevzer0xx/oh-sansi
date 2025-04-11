<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ObtenerMaterias extends Controller
{
    /**
     * Obtener las materias según el grado
     */
    public function obtenerMaterias(Request $request): JsonResponse
    {
        Log::info("YA PUEEEEESSS");

        // Validar que se reciba el parámetro "grado"
        $request->validate([
            'grado' => 'required|string'
        ]);

        $grado = $request->input('grado');

        // Obtener las materias disponibles para ese grado
        $materias = DB::table('area')
            ->where('grado', $grado)
            ->pluck('nombre');

        return response()->json(["materias" => $materias], 200);
    }
}
