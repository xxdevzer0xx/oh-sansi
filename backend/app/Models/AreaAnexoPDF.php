<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AreaAnexoPDF extends Model
{
    use HasFactory;

    protected $fillable = ['original_name', 'mime_type', 'content'];

    public $timestamps = true;
}
