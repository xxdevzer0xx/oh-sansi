<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class ObtenerMaterias extends Controller
{
    /**
     * Obtener las materias/áreas según el grado seleccionado
     */
    public function obtenerMaterias(Request $request): JsonResponse
    {
        $request->validate([
            'grado' => 'required|string'
        ]);

        $gradoNombre = $request->input('grado');

        // Buscar el ID del grado
        $grado = DB::table('grados')->where('nombre_grado', $gradoNombre)->first();

        if (!$grado) {
            return response()->json(['error' => 'Grado no encontrado'], 404);
        }

        // Obtener el ID del grado
        $gradoId = $grado->id_grado;

        // Buscar niveles/categorías que aplican para este grado
        $niveles = DB::table('niveles_categoria as nc')
            ->join('areas_competencia as a', 'nc.id_area', '=', 'a.id_area')
            ->where('nc.id_grado_min', '<=', $gradoId)
            ->where('nc.id_grado_max', '>=', $gradoId)
            ->select('a.nombre_area', 'nc.nombre_nivel')
            ->get();

        // Agrupar por área (en Informática y Robótica mostrar categorías)
        $resultado = [];

        foreach ($niveles as $nivel) {
            $area = $nivel->nombre_area;
            $categoria = $nivel->nombre_nivel;

            if (!isset($resultado[$area])) {
                $resultado[$area] = [];
            }

            // Para Informática y Robótica incluir las categorías
            if (in_array($area, ['INFORMÁTICA', 'ROBÓTICA'])) {
                $resultado[$area][] = $categoria;
            } else {
                $resultado[$area] = null; // áreas simples, sin categorías
            }
        }

        return response()->json(['materias' => $resultado], 200);
    }
}
