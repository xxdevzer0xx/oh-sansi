<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Convocatoria extends Model
{
    protected $fillable = ['nombre', 'fecha_inicio_inscripcion', 'fecha_fin_inscripcion', 'max_areas_por_estudiante', 'estado'];

    public function areas()
    {
        return $this->belongsToMany(AreaCompetencia::class, 'convocatoria_areas', 'id_convocatoria', 'id_area')
                    ->withPivot('costo_inscripcion');
    }
}