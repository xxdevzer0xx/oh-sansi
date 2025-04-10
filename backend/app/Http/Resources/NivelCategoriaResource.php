<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NivelCategoriaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id_nivel,
            'nombre_nivel' => $this->nombre_nivel,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
