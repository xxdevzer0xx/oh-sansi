<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Boleta extends Model
{
    protected $fillable = ['codigo', 'monto', 'estado'];

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class);
    }
}