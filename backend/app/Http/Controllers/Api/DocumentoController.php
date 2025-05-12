<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Convocatoria;
use App\Models\ConvocatoriaArea;

class DocumentoController extends ApiController
{
    /**
     * Devuelve las áreas asociadas a una convocatoria.
     */
    public function obtenerAreasPorConvocatoria(int $id): JsonResponse
    {
        $convocatoria = Convocatoria::find($id);

        if (!$convocatoria) {
            return $this->errorResponse('Convocatoria no encontrada', 404);
        }

        $areas = ConvocatoriaArea::where('id_convocatoria', $id)
            ->with('area') // Asegúrate de que la relación area() exista en el modelo
            ->get();

        return $this->successResponse($areas, 'Áreas obtenidas correctamente');
    }

    /**
     * Recibirá un documento PDF más adelante.
     */
    public function subirDocumento(Request $request): JsonResponse
    {
        // Lógica pendiente para subir archivo y registrar datos.
        return $this->successResponse(null, 'Espacio reservado para subir documentos');
    }
}
