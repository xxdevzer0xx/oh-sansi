<?php

namespace App\Http\Controllers\Api;

use App\Models\ConvocatoriaArea;
use Illuminate\Http\Request;
use App\Http\Resources\ConvocatoriaAreaResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ConvocatoriaAreaController extends ApiController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ConvocatoriaArea::with(['convocatoria', 'area']);
        
        // Filter by convocatoria_id if provided
        if ($request->has('convocatoria_id')) {
            $query->where('id_convocatoria', $request->convocatoria_id);
        }
        
        $areas = $query->get();
            
        return $this->successResponse(
            ConvocatoriaAreaResource::collection($areas),
            'Áreas de convocatoria obtenidas correctamente'
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'id_convocatoria' => 'required|exists:convocatorias,id_convocatoria',
            'areas' => 'required|array|min:1',
            'areas.*.id_area' => 'required|exists:areas_competencia,id_area',
            'areas.*.costo_inscripcion' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        foreach ($request->input('areas') as $area) {
            ConvocatoriaArea::create([
                'id_convocatoria' => $request->input('id_convocatoria'),
                'id_area' => $area['id_area'],
                'costo_inscripcion' => $area['costo_inscripcion'],
            ]);
        }

        return response()->json(['message' => 'Áreas asociadas correctamente'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        $area = ConvocatoriaArea::with(['convocatoria', 'area'])->find($id);
        
        if (!$area) {
            return $this->errorResponse('Área de convocatoria no encontrada', 404);
        }
        
        return $this->successResponse(
            new ConvocatoriaAreaResource($area),
            'Área de convocatoria obtenida correctamente'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $area = ConvocatoriaArea::find($id);
        
        if (!$area) {
            return $this->errorResponse('Área de convocatoria no encontrada', 404);
        }
        
        $validator = Validator::make($request->all(), [
            'costo_inscripcion' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422);
        }

        $area->update($request->all());
        
        return $this->successResponse(
            new ConvocatoriaAreaResource($area->fresh(['convocatoria', 'area'])),
            'Área de convocatoria actualizada correctamente'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $area = ConvocatoriaArea::find($id);
        
        if (!$area) {
            return $this->errorResponse('Área de convocatoria no encontrada', 404);
        }
        
        // Check for related inscriptions
        if ($area->inscripciones()->exists()) {
            return $this->errorResponse('No se puede eliminar esta área porque tiene inscripciones asociadas', 409);
        }
        
        $area->delete();
        
        return $this->successResponse(
            null,
            'Área de convocatoria eliminada correctamente'
        );
    }
}
