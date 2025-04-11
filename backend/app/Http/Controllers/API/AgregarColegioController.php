<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class AgregarColegioController extends Controller
{
    /**
     * Agregar una nueva unidad educativa
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:200|unique:unidades_educativas,nombre',
            'departamento' => 'required|string|max:100',
            'provincia' => 'required|string|max:100',
        ]);

        $id = DB::table('unidades_educativas')->insertGetId([
            'nombre' => $request->input('nombre'),
            'departamento' => $request->input('departamento'),
            'provincia' => $request->input('provincia'),
        ]);

        return response()->json([
            'message' => 'Unidad educativa agregada exitosamente',
            'id' => $id,
        ], 201);
    }
}
