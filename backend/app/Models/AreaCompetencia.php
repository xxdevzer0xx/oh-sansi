<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AreaCompetencia extends Model
{
    protected $table = 'areas_competencia';
    protected $fillable = ['nombre_area'];

    public function niveles()
    {
        return $this->hasMany(NivelCategoria::class, 'id_area');
    }
}