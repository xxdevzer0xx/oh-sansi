import React from 'react';
import { EstudianteFormData} from '../types/index';

interface Props {
  componentRef: any
  encargado: {
    correo: string, 
    ci: string,
    nombre: string
  }
  estudiantes: EstudianteFormData[] , 
  costoTotalGeneral:number,
  numeroOrden: string,
}



const BoletaInfo: React.FC<Props> = ({componentRef, estudiantes , costoTotalGeneral, encargado, numeroOrden}) => {
  
  const total = Number(costoTotalGeneral || 0);
  return (
    <div ref={componentRef} className="p-6 bg-white border border-black w-[800px] mx-auto text-[14px]">
      {/* Encabezado institucional */}
    <div className="flex justify-between items-start mb-2">
      <div className="text-left leading-tight">
        <p className="font-bold">UNIVERSIDAD MAYOR DE SAN SIMÓN</p>
        <p className="font-semibold">FACULTAD DE CIENCIAS Y TECNOLOGÍA</p>
        <p className="font-semibold">SECRETARÍA ADMINISTRATIVA</p>
      </div>

    </div>

      {/* Orden de pago + número */}
      <div className="flex flex-col items-center flex-1">
        <div className="text-xl font-bold">ORDEN DE PAGO</div>
        <div className="w-full flex justify-end">
          <div className="text-red-600 font-bold">N° {numeroOrden}</div>
        </div>
      </div>

      {/* Señor(es): */}
      <div className="mb-4 flex justify-between">
        <div>Señor(es): {encargado.nombre}</div>
        <div>CI: {encargado.ci}</div>
      </div>

      {/* Detalle de estudiantes */}
      <h4 className="font-medium text-gray-800 mb-2">Detalle de Estudiantes</h4>
      <div className="border-t border-b py-2">
        <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Estudiante</div>
          <div className="col-span-2">CI</div>
          <div className="col-span-3">Áreas</div>
          <div className="col-span-2 text-right">Costo</div>
        </div>

        {estudiantes.map((estudiante, index) => {
          const costoPorEstudiante = estudiante.areas_seleccionadas
            ? estudiante.areas_seleccionadas.reduce((total, area) => total + (parseFloat(area.costo) || 0), 0)
            : 0;

          return (index < 5 ) ? (
            <div key={estudiante.id} className="grid grid-cols-12 gap-2 mb-1 text-sm py-1 border-b border-gray-100">
              <div className="col-span-1">{index + 1}</div>
              <div className="col-span-4">{estudiante.nombres} {estudiante.apellidos}</div>
              <div className="col-span-2">{estudiante.ci}</div>
              <div className="col-span-3">
                {estudiante.areas_seleccionadas && estudiante.areas_seleccionadas.length > 0 ? (
                  <div className="flex flex-col">
                    {estudiante.areas_seleccionadas.map((area, i) => (
                      <span key={i} className="text-xs">{area.area_nombre} - {area.nivel_nombre}</span>
                    ))}
                  </div>
                ) : 'Sin áreas'}
              </div>
              <div className="col-span-2 text-right">{costoPorEstudiante.toFixed(2)} Bs.</div>
            </div>
          ) : ( <div style={{"display":"none"}} ></div>);
        })}
      </div>

      {/* Total a pagar */}
      <div className="flex justify-between items-center py-2 text-sm">
        <p className="font-medium">Subtotal</p>
        <p className="font-medium">{total.toFixed(2)} Bs.</p>
      </div>
      <div className="flex justify-between items-center py-2 text-sm font-bold">
        <p>TOTAL A PAGAR</p>
        <p>{total.toFixed(2)} Bs.</p>
      </div>
    </div>
  );
};

export default BoletaInfo;
