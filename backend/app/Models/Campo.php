<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campo extends Model
{
    protected $table = 'campos';
    protected $primaryKey = 'id_campo';
    
    protected $fillable = [
        'nombre_campo',
        'etiqueta',
        'obligatorio',
        'activo',
        'categoria'
    ];
    
    public $timestamps = false;
    public static function getActiveFieldsByCategory($category)
    {
        return self::where('activo', 1)
                  ->where('categoria', $category)
                  ->get();
    }
}