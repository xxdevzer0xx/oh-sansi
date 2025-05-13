<?php

namespace App\Http\Controllers\Api;

use App\Models\AreaAnexoPDF;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Response;

class AreaAnexoPDFController extends Controller
{
    public function subirPDF(Request $request)
    {
        $request->validate([
            'pdf' => 'required|mimes:pdf|max:10240', // max 10MB
            'id_convocatoria_area' => 'required|string'
        ]);

        $file = $request->file('pdf');
 
        $pdf = new AreaAnexoPDF();
        $pdf->original_name = $file->getClientOriginalName();
        $pdf->mime_type = $file->getMimeType();
        $pdf->content = $file->getContent();
        $pdf->save();

        return response()->json([
            'message' => 'PDF stored in database successfully',
            'id' => $pdf->id,
        ]);
    }

    public function descargarPDF($id)
    {
        $pdf = AreaAnexoPDF::find($id);

        if (!$pdf) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return Response::make($pdf->content, 200, [
            'Content-Type' => $pdf->mime_type,
            'Content-Disposition' => 'attachment; filename="' . $pdf->original_name . '"',
        ]);
    }
}





