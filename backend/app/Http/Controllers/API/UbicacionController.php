<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class UbicacionController extends Controller
{
    /**
     * Obtener todos los departamentos
     */
    public function obtenerDepartamentos(): JsonResponse
    {
        $departamentos = DB::table('departamentos')->select('id', 'nombre')->get();
        return response()->json(['departamentos' => $departamentos], 200);
    }

    /**
     * Obtener provincias por departamento
     */
    public function obtenerProvincias(Request $request): JsonResponse
    {
        $request->validate([
            'id_departamento' => 'required|integer'
        ]);

        $provincias = DB::table('provincias')
            ->where('id_departamento', $request->input('id_departamento'))
            ->select('id', 'nombre')
            ->get();

        return response()->json(['provincias' => $provincias], 200);
    }

    /**
     * Obtener colegios por provincia
     */
    public function obtenerColegios(Request $request): JsonResponse
    {
        $request->validate([
            'id_provincia' => 'required|integer'
        ]);

        $colegios = DB::table('colegios')
            ->where('id_provincia', $request->input('id_provincia'))
            ->select('id', 'nombre')
            ->get();

        return response()->json(['colegios' => $colegios], 200);
    }
}
