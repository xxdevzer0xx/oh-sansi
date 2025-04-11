<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class ConvocatoriaCompletaController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Controlador funcionando']);
    }
}
