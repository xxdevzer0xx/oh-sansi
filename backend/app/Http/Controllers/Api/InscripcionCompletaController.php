<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use App\Models\Grado;
use App\Models\Inscripcion;
use App\Models\OrdenPago;
use App\Models\TutorAcademico;
use App\Models\TutorLegal;
use App\Models\UnidadEducativa;
use Facade\FlareClient\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class InscripcionCompletaController extends ApiController
{
    /**
     * Realiza el proceso completo de inscripción en una sola petición
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function inscribirEstudiante(Request $request): JsonResponse
    {


        // Validar datos de entrada
        // $validator = Validator::make($request->all(), [
        //     // Datos del estudiante
        //     'estudiante.nombres' => 'required|string|max:100',
        //     'estudiante.apellidos' => 'required|string|max:100',
        //     'estudiante.ci' => 'required|string|max:20',
        //     'estudiante.fecha_nacimiento' => 'required|date',
        //     'estudiante.email' => 'nullable|email|max:100',
        //     'estudiante.id_unidad_educativa' => 'required|exists:unidades_educativas,id_unidad_educativa',
        //     'estudiante.id_grado' => 'required|exists:grados,id_grado',
            
        //     // Datos del tutor legal
        //     'tutor_legal.nombres' => 'required|string|max:100',
        //     'tutor_legal.apellidos' => 'required|string|max:100',
        //     'tutor_legal.ci' => 'required|string|max:20',
        //     'tutor_legal.telefono' => 'required|string|max:20',
        //     'tutor_legal.email' => 'nullable|email|max:100',
        //     'tutor_legal.parentesco' => 'required|string|max:50',
        //     'tutor_legal.es_el_mismo_estudiante' => 'boolean',
            
        //     // Datos del tutor académico (opcional)
        //     'tutor_academico.nombres' => 'nullable|string|max:100',
        //     'tutor_academico.apellidos' => 'nullable|string|max:100',
        //     'tutor_academico.ci' => 'nullable|string|max:20',
        //     'tutor_academico.telefono' => 'nullable|string|max:20',
        //     'tutor_academico.email' => 'nullable|email|max:100',
            
        //     // Áreas seleccionadas
        //     'areas_seleccionadas' => 'required|array|min:1',
        //     'areas_seleccionadas.*.id_convocatoria_area' => 'required|exists:convocatoria_areas,id_convocatoria_area',
        //     'areas_seleccionadas.*.id_convocatoria_nivel' => 'required|exists:convocatoria_niveles,id_convocatoria_nivel',
        // ]);

        // if ($validator->fails()) {
        //     return $this->errorResponse($validator->errors()->first(), 422);
        // }

        // Iniciar transacción
        DB::beginTransaction();
        
        try {
            // 1. Crear o actualizar tutor legal
            $tutorLegalData = $request->input('tutor_legal');
            $tutorLegal = $this->crearOActualizarTutorLegal($tutorLegalData);
            // Log::info(json_encode(, JSON_PRETTY_PRINT));
            $tutorAcademico = null;
            if ($request->has('tutor_academico') && $request->input('tutor_academico')) {
                $tutorAcademicoData = $request->input('tutor_academico');
                $tutorAcademico = $this->crearOActualizarTutorAcademico($tutorAcademicoData);
            }
            Log::info(json_encode($tutorLegal, JSON_PRETTY_PRINT));
            Log::info(json_encode($tutorAcademico, JSON_PRETTY_PRINT));

            // 2. Crear o actualizar estudiante
            $estudianteData = $request->input('estudiante');
            $estudianteData['id_tutor_legal'] = $tutorLegal->id_tutor_legal;

            $unidadEducativaData = [
                'nombre' => $estudianteData['unidad_educativa'],
                'departamento' => $estudianteData['departamento'],
                'provincia' => $estudianteData['provincia'],
            ];
            $unidadEducativa = $this->crearOActualizarUnidadEducativa($unidadEducativaData);

            $estudianteData['id_unidad_educativa'] = $unidadEducativa->id_unidad_educativa;

            $gradoId = $this->getGradoId( $estudianteData['grado']);

            $estudianteData['id_grado'] = $gradoId;
            $estudiante = $this->crearOActualizarEstudiante($estudianteData);

            // 3. Crear o actualizar tutor académico (si existe)
            Log::info(json_encode($estudiante, JSON_PRETTY_PRINT));
            
            // 4. Crear inscripciones
            $inscripciones = [];
            $costoTotal = 0;
            
            foreach ($request->input('areas_seleccionadas') as $areaSeleccionada) {
                $inscripcion = new Inscripcion([
                    'id_estudiante' => $estudiante->id_estudiante,
                    'id_convocatoria_area' => $areaSeleccionada['id_convocatoria_area'],
                    'id_convocatoria_nivel' => $areaSeleccionada['id_convocatoria_nivel'],
                    'id_tutor_academico' => $tutorAcademico ? $tutorAcademico->id_tutor_academico : null,
                    'fecha_inscripcion' => now(),
                    'estado' => 'pendiente'
                ]);
                
                $inscripcion->save();
                $inscripciones[] = $inscripcion;
                
                // Sumar el costo de la inscripción
                $costoInscripcion = $inscripcion->convocatoriaArea->costo_inscripcion;
                $costoTotal += $costoInscripcion;
            }
            Log::info(json_encode($inscripciones, JSON_PRETTY_PRINT));
            
            // 5. Crear orden de pago
            $ordenPago = new OrdenPago([
                'codigo_unico' => 'OP-' . strtoupper(Str::random(8)),
                'tipo_origen' => 'individual',
                'id_inscripcion' => $inscripciones[0]->id_inscripcion, // Primera inscripción
                'monto_total' => $costoTotal,
                'fecha_emision' => now(),
                'fecha_vencimiento' => now()->addDays(5), // 5 días para pagar
                'estado' => 'pendiente'
            ]);
            Log::info(json_encode(
                ['estudiante' => $estudiante,
                'inscripciones' => $inscripciones,
                'orden_pago' => $ordenPago,
                'costo_total' => $costoTotal]
                , JSON_PRETTY_PRINT));
            
            $ordenPago->save();
            
            // Confirmar transacción
            DB::commit();
            
            // Retornar respuesta exitosa
            return $this->successResponse([
                'estudiante' => $estudiante,
                'inscripciones' => $inscripciones,
                'orden_pago' => $ordenPago,
                'costo_total' => $costoTotal
            ], 'Inscripción realizada correctamente', 201);
            
        } catch (\Exception $e) {
            // Revertir transacción en caso de error
            DB::rollBack();
            return $this->errorResponse('Error al realizar la inscripción: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Crea o actualiza un tutor legal
     */
    private function crearOActualizarTutorLegal(array $data): TutorLegal
    {
        // Buscar por CI
        $tutorLegal = TutorLegal::where('ci', $data['ci'])->first();
        
        if ($tutorLegal) {
            $tutorLegal->update($data);
        } else {
            $tutorLegal = TutorLegal::create($data);
        }
        
        return $tutorLegal;
    }

    /**
     * Crea o actualiza un unidad educativa
     */
    private function crearOActualizarUnidadEducativa(array $data): UnidadEducativa
    {
        // Buscar por nombre
        $unidadEducativa = UnidadEducativa::where('nombre', $data['nombre'])->first();
        
        if ($unidadEducativa) {
            $unidadEducativa->update($data);
        } else {
            $unidadEducativa = UnidadEducativa::create($data);
        }
        
        return $unidadEducativa;
    }
    
    /**
     * Crea o actualiza un estudiante
     */
    private function crearOActualizarEstudiante(array $data): Estudiante
    {
        // Buscar por CI
        $estudiante = Estudiante::where('ci', $data['ci'])->first();
        
        if ($estudiante) {
            $estudiante->update($data);
        } else {
            $estudiante = Estudiante::create($data);
        }
        
        return $estudiante;
    }
    
    private function getGradoId($grado) : int
    {
        return $grado = Grado::where('nombre_grado', $grado)->first()->id_grado;
    }

    /**
     * Crea o actualiza un tutor académico
     */
    private function crearOActualizarTutorAcademico(array $data): ?TutorAcademico
    {
        if (empty($data['nombres']) || empty($data['apellidos'])) {
            return null;
        }
        
        // Buscar por CI si existe
        $tutorAcademico = null;
        if (!empty($data['ci'])) {
            $tutorAcademico = TutorAcademico::where('ci', $data['ci'])->first();
        }
        
        if ($tutorAcademico) {
            $tutorAcademico->update($data);
        } else {
            $tutorAcademico = TutorAcademico::create($data);
        }
        
        return $tutorAcademico;
    }
}


/*

{
    "id": "",
    "student": {
      "name": "wqeqew",
      "lastName": "asdasd",
      "ci": "1234567",
      "birthDate": "",
      "email": "asdasd@awsda.com",
      "phone": "77654321",
      "colegio": "asdasd",
      "gradeId": "",
      "areas": [],
      "departamento": "La Paz",
      "provincia": "sadasd",
      "guardian": {
        "lastName": "wqeqeqww",
        "name": "qewqwewq",
        "ci": "87654321",
        "email": "asdasd@awsda.com",
        "phone": "76543211"
      }
    },
    "areas": "",
    "totalCost": 0,
    "paymentStatus": "pending",
    "registrationDate": "Thu Apr 10 2025",
    "selectedLevels": "",
    "teachers": [
      {
        "lastName": "asasd",
        "name": "asdasd",
        "ci": "asdad",
        "email": "qweqwe",
        "phone": "qweqew"
      },
      {
        "lastName": "sads",
        "name": "asdfsda",
        "ci": "asd",
        "email": "asdfasf",
        "phone": "asdfasfd"
      }
    ],
    "olympiadId": "21"
  }

  **/ 












