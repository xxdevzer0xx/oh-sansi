<?php

namespace App\Http\Controllers;

use App\Models\Campo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CampoController extends Controller
{
    public function index()
    {
        try {
            $campos = Campo::all()->map(function ($campo) {
                return [
                    'id_campo' => $campo->id_campo,
                    'nombre_campo' => $campo->nombre_campo,
                    'etiqueta' => $campo->etiqueta,
                    'obligatorio' => (bool)$campo->obligatorio,
                    'activo' => (bool)$campo->activo,
                    'categoria' => $campo->categoria
                ];
            });

            return response()->json($campos);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al cargar los campos',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateConfig(Request $request)
    {
        DB::beginTransaction();
        
        try {
            $request->validate([
                '*.id' => 'required|integer|exists:campos,id_campo',
                '*.is_required' => 'required|boolean',
                '*.is_active' => 'required|boolean'
            ]);

            foreach ($request->all() as $campoData) {
                Campo::where('id_campo', $campoData['id'])
                    ->update([
                        'obligatorio' => $campoData['is_required'] ? 1 : 0,
                        'activo' => $campoData['is_active'] ? 1 : 0
                    ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Configuración actualizada correctamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al actualizar la configuración',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}