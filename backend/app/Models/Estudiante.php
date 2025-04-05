<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    protected $fillable = [
        'nombres', 'apellidos', 'ci', 'fecha_nacimiento',
        'unidad_educativa', 'grado', 'es_menor'
    ];

    public function tutor()
    {
        return $this->hasOne(Tutor::class);
    }

    public function boletas()
    {
        return $this->hasMany(Boleta::class);
    }
}