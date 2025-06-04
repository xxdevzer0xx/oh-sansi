<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;
use App\Models\OrdenPago;

class ComprobanteOCRController extends Controller
{
    public function verificarComprobante(Request $request): JsonResponse
{
    $validator = Validator::make($request->all(), [
        'pdf_comprobante' => 'required|file|mimes:pdf|max:2048',
    ]);

    if ($validator->fails()) {
        return response()->json(['verificado' => false, 'message' => $validator->errors()->first()], 422);
    }

    $file = $request->file('pdf_comprobante');
    $path = $file->store('comprobantes_temp', 'public');
    $fullPath = storage_path("app/public/{$path}");

    // 1. Intentar extraer texto con smalot/pdfparser
    $parser = new \Smalot\PdfParser\Parser();
    $pdf = $parser->parseFile($fullPath);
    $ocrText = $pdf->getText();

    // Si el texto extraído es muy corto, usar OCR.Space
    if (strlen(trim($ocrText)) < 100) {
        try {
            $ocrResponse = Http::attach(
                'file', file_get_contents($fullPath), 'comprobante.pdf'
            )->post('https://api.ocr.space/parse/image', [
                'apikey' => env('OCR_SPACE_KEY'),
                'language' => 'spa',
                'isOverlayRequired' => false,
            ]);

            $ocrText = $ocrResponse['ParsedResults'][0]['ParsedText'] ?? '';
        } catch (\Exception $e) {
            return response()->json([
                'verificado' => false,
                'message' => 'Error al usar OCR externo: ' . $e->getMessage(),
            ], 500);
        }
    }

    Storage::disk('public')->delete($path);

    // === A partir de aquí usas tu lógica existente ===
    preg_match('/O-[A-Z]+-\d{4}-\d+/', $ocrText, $matches);
    $codigo = $matches[0] ?? null;

    if (!$codigo) {
        return response()->json([
            'verificado' => false,
            'message' => 'No se encontró un código válido en el comprobante.',
            'texto_extraido' => $ocrText,
        ], 422);
    }

    $backendUrl = env('BACKEND_URL');
    $response = Http::get("http://127.0.0.1:8000/api/orden/by-code/{$codigo}");

    if ($response->failed()) {
        return response()->json([
            'verificado' => false,
            'message' => 'No se pudo obtener la información de la orden de pago.',
            'texto_extraido' => $ocrText,
            'codigo_detectado' => $codigo,
        ], 500);
    }

    $data = $response->json()['data'];
    $errores = [];

    // Validar nombre del pagador
    $nombreDetectado = null;
    if (preg_match('/(Cliente|Recib[ií] de|Se recibi[oó] de):?\s*([A-Za-zÁÉÍÓÚáéíóúñÑ ]+)/i', $ocrText, $m)) {
        $nombreDetectado = trim($m[2]);
    }

    $normalizar = function ($str) {
        $str = mb_strtoupper($str, 'UTF-8');
        $str = preg_replace('/[áàäâ]/iu', 'A', $str);
        $str = preg_replace('/[éèëê]/iu', 'E', $str);
        $str = preg_replace('/[íìïî]/iu', 'I', $str);
        $str = preg_replace('/[óòöô]/iu', 'O', $str);
        $str = preg_replace('/[úùüû]/iu', 'U', $str);
        $str = preg_replace('/[^A-Z ]/', '', $str);
        $str = preg_replace('/\s+/', ' ', $str);
        return trim($str);
    };

    if ($nombreDetectado) {
        if ($normalizar($nombreDetectado) !== $normalizar($data['encargado']['nombre'])) {
            $errores[] = 'El nombre del pagador no coincide con el encargado registrado.';
        }
    } else {
        $errores[] = 'No se pudo detectar el nombre del pagador.';
    }

    // Validar monto
    if (!str_contains($ocrText, (string) $data['monto_total'])) {
        $errores[] = 'El monto total no coincide con el comprobante.';
    }

    // Validar áreas por nombre
    $areasContadas = [];
    foreach ($data['estudiantes'] as $e) {
        $area = strtolower($e->nombre_area);
        $areasContadas[$area] = ($areasContadas[$area] ?? 0) + 1;
    }
    foreach ($areasContadas as $area => $cantidad) {
        $patron = "/{$cantidad}.*{$area}/i";
        if (!preg_match($patron, $ocrText)) {
            $errores[] = "No se detectó correctamente la inscripción a {$cantidad} {$area}.";
        }
    }

    // Validar cantidad de estudiantes
    if (!str_contains($ocrText, (string) count($data['estudiantes']))) {
        $errores[] = 'La cantidad de estudiantes en el comprobante no coincide.';
    }

    // Si todo OK, marcar como pagado
    if (count($errores) === 0 && isset($data['orden']['id'])) {
        \App\Models\OrdenPago::where('id_orden', $data['orden']['id'])->update(['estado' => 'pagada']);
    }

    return response()->json([
        'verificado' => count($errores) === 0,
        'errores' => $errores,
        'codigo_detectado' => $codigo,
        'texto_extraido' => $ocrText,
    ]);
}

}
