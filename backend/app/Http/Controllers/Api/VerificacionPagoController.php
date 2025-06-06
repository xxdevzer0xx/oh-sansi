<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Smalot\PdfParser\Parser;
use App\Models\OrdenPago;
use App\Models\EncargadoPago;
use App\Models\ComprobantePago;

class VerificacionPagoController extends Controller
{
    public function verificarEstado(Request $request): JsonResponse
    {
        $codigo = $request->get('codigo');

        $orden = OrdenPago::where('codigo_unico', $codigo)->first();

        if (!$orden) {
            return response()->json(['message' => 'Orden de pago no encontrada'], 404);
        }

        switch ($orden->estado) {
            case 'pendiente':
                return response()->json(['message' => 'Orden de pago pendiente']);
            case 'vencida':
                return response()->json(['message' => 'Orden de pago vencida']);
            case 'pagada':
                return response()->json(['message' => 'Orden de pago pagada']);
            default:
                return response()->json(['message' => 'Estado desconocido'], 400);
        }
    }

    public function procesarComprobante(Request $request): JsonResponse
    {
        \Log::info('Contenido recibido:', [
            'archivo' => json_encode( $request->file('archivo')),
            'codigo' => $request->input('codigo'),
        ]);

        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string',
            'archivo' => 'required|file|mimes:pdf'
        ]);

        if ($validator->fails()) {
            //dd($validator->errors());
        return response()->json([
            'success' => false,
            'message' => 'Errores de validación',
            'errors' => $validator->errors()
        ], 422);
    }	

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $codigo = $request->get('codigo');
        $archivo = $request->file('archivo');

        $orden = OrdenPago::where('codigo_unico', $codigo)->first();

        if (!$orden) {
            return response()->json(['message' => 'Orden de pago no encontrada'], 404);
        }

        // Paso 1: extraer texto del PDF
        $parser = new Parser();
        $pdf = $parser->parseFile($archivo->getPathname());
        $text = $pdf->getText();

        preg_match('/Recib[ií] de[:：]?\s*(.+)/iu', $text, $matchNombre);
        preg_match('/DOCUMENTO\s*[:：]?\s*(\d+)/i', $text, $matchDoc);
        preg_match('/Aclaraci[oó]n\s*[:：]?\s*(.+?)\s*(\n|–)/iu', $text, $matchAclaracion); // elimina guiones raros
        preg_match('/Total[:：]?\s*Bs\s*([\d\.]+)/i', $text, $matchTotal);
        preg_match('/Nro\.\s*(\d+)/i', $text, $matchNro);
        preg_match('/Fecha[:：]?\s*(\d{2}-\d{2}-\d{2})/i', $text, $matchFecha);

        $nombrePagador = $matchNombre[1] ?? null;
        $documento = $matchDoc[1] ?? null;
        $aclaracion = $matchAclaracion[1] ?? null;
        $total = $matchTotal[1] ?? null;
        $numeroComprobante = $matchNro[1] ?? null;
        $fechaPago = $matchFecha[1] ?? null;

        //return response()->json([
        //   'status' => 'OCR_OK',
        //   'mensaje' => 'Datos extraídos del PDF',
        //    'nombre_pagador' => $nombrePagador,
        //    'documento' => $documento,
        //    'aclaracion' => $aclaracion,
        //    'total' => $total,
        //    'numero_comprobante' => $numeroComprobante,
        //    'fecha_pago' => $fechaPago,
        //]);


        // Paso 2: Obtener datos relacionados
        $idLista = $orden->id_lista;
        $encargado = EncargadoPago::where('id_lista', $idLista)->first();

        if (!$encargado) {
            return response()->json(['message' => 'Encargado de pago no encontrado'], 404);
        }

        // Paso 3: Comparaciones
        if ($aclaracion !== $orden->codigo_unico) {
           return response()->json(['message' => 'El codigo no coincide'], 400);
        }

        $nombreCompletoEncargado = trim($encargado->apellidos . ' ' . $encargado->nombres);

        // Comparación insensible a mayúsculas/minúsculas y con espacios controlados
        if (strcasecmp(trim($nombrePagador), $nombreCompletoEncargado) !== 0) {
            return response()->json([
            'message' => "El nombre del pagador no coincide."], 400);
        }

        if (floatval($total) !== floatval($orden->monto_total)) {
            return response()->json(['message' => 'El monto no corresponde a ' . $orden->monto_total], 400);
        }

        if ($documento !== $encargado->ci) {
            return response()->json([
            'message' => "El CI no coincide. CI del PDF: '{$documento}', CI esperado: '{$encargado->ci}'"], 400);
        }

        // Paso 4: Guardar en la BD y actualizar estado
        DB::beginTransaction();

        try {
            $orden->estado = 'pagada';
            $orden->save();

            $ruta = $archivo->store('comprobantes');

            ComprobantePago::create([
                'fecha_pago' => $fechaPago,
                'monto_pagado' => $total,
                'nombre_pagador' => $encargado->apellidos . ' ' . $encargado->nombres,
                'numero_comprobante' => $numeroComprobante,
                'pdf_comprobante' => $ruta,
                'estado_verificacion' => 'verificado',
                'id_orden' => $orden->id_orden,
            ]);

            DB::commit();

            return response()->json(['message' => 'Verificacion completada, su inscripcion se realizo con exito']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al guardar el comprobante', 'error' => $e->getMessage()], 500);
        }
    }
}
