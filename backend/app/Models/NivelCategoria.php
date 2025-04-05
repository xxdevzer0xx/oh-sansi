<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NivelCategoria extends Model
{
    protected $table = 'niveles_categoria';
    protected $fillable = ['nombre_nivel', 'id_area', 'id_grado_min', 'id_grado_max'];
}