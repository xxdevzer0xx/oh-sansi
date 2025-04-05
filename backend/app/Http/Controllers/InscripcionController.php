<?php

namespace App\Http\Controllers;

use App\Models\{Estudiante, TutorLegal, TutorAcademico, Inscripcion, OrdenPago};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InscripcionController extends Controller
{
    public function inscribir(Request $request)
    {
        $request->validate([
            'estudiante.nombres' => 'required',
            'estudiante.ci' => 'required|unique:estudiantes,ci',
            'convocatoria_id' => 'required|exists:convocatorias,id',
            'areas' => 'required|array|max:2' // Máximo 2 áreas por convocatoria
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Registrar Estudiante
            $estudiante = Estudiante::create($request->estudiante);

            // 2. Registrar Tutores
            if ($request->tutor_legal) {
                $tutorLegal = TutorLegal::create($request->tutor_legal);
                $estudiante->update(['id_tutor_legal' => $tutorLegal->id]);
            }

            // 3. Crear Inscripciones
            foreach ($request->areas as $area) {
                $inscripcion = Inscripcion::create([
                    'id_estudiante' => $estudiante->id,
                    'id_convocatoria_area' => $area['id'],
                    'id_convocatoria_nivel' => $area['nivel_id'],
                    'id_tutor_academico' => $request->tutor_academico['id'] ?? null
                ]);
            }

            // 4. Generar Orden de Pago
            $orden = OrdenPago::create([
                'codigo_unico' => 'ORD-' . Str::upper(Str::random(10)),
                'tipo_origen' => 'individual',
                'id_inscripcion' => $inscripcion->id,
                'monto_total' => collect($request->areas)->sum('costo'),
                'fecha_emision' => now(),
                'fecha_vencimiento' => now()->addDays(3)
            ]);

            return response()->json([
                'orden_pago' => $orden->codigo_unico,
                'total' => $orden->monto_total
            ]);
        });
    }

    public function getAreas()
    {
        return response()->json([
            'areas' => AreaCompetencia::with('niveles')->get()
        ]);
    }
}