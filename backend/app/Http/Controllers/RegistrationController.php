<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Campo;
use Illuminate\Support\Facades\Validator;

class RegistrationController extends Controller
{
    public function getFieldsConfig()
    {
        try {
            $campos = Campo::where('activo', 1)->get()->map(function ($campo) {
                return [
                    'field_key' => $campo->etiqueta,
                    'is_required' => (bool)$campo->obligatorio,
                    'field_name' => $campo->nombre_campo,
                    'category' => $campo->categoria,
                    'is_active' => true
                ];
            });
            
            return response()->json($campos->toArray());
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al cargar la configuración: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function submitForm(Request $request)
    {
        try {
            $campos = Campo::where('activo', 1)->get();
            
            $rules = [];
            $messages = [];
            
            foreach ($campos as $campo) {
                if ($campo->obligatorio) {
                    $rules[$campo->etiqueta] = 'required';
                    $messages[$campo->etiqueta.'.required'] = $campo->nombre_campo.' es requerido';
                }
            }
            
            $rules['areas'] = 'required|array|min:1';
            $messages['areas.required'] = 'Debe seleccionar al menos un área';
            
            $validator = Validator::make($request->all(), $rules, $messages);
            
            if ($validator->fails()) {
                return response()->json([
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return response()->json([
                'message' => 'Formulario enviado correctamente',
                'data' => $request->all()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al procesar el formulario: ' . $e->getMessage()
            ], 500);
        }
    }
}