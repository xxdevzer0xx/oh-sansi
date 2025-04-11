import React from "react";
import { useForm } from "react-hook-form";

interface ConvocatoriaForm {
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  maxAreas: number;
  estado: string;
}

const NuevaConvocatoria: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    setValue,
  } = useForm<ConvocatoriaForm>({
    mode: "onChange",
    defaultValues: {
      maxAreas: 2,
    },
  });

  const onSubmit = async (data: ConvocatoriaForm) => {
    const payload = {
      nombre: data.titulo,
      fecha_inicio_inscripcion: data.fechaInicio,
      fecha_fin_inscripcion: data.fechaFin,
      max_areas_por_estudiante: data.maxAreas,
      estado: data.estado.toLowerCase(),
    };

    try {
      const response = await fetch("http://localhost:8000/api/v1/convocatorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Convocatoria creada correctamente");
        console.log(result);
      } else {
        alert("❌ Error: " + result.message);
        console.error(result);
      }
    } catch (error) {
      console.error("❌ Error en la solicitud:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-2">Nueva Convocatoria</h2>
        <p className="text-sm text-gray-500 mb-4">
          Crea una nueva convocatoria para olimpiadas científicas.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* TÍTULO */}
          <div>
            <label className="block text-sm font-medium">Título</label>
            <input
              type="text"
              {...register("titulo", { required: "El título es obligatorio" })}
              className="w-full p-2 border rounded mt-1"
              placeholder="Título de la convocatoria"
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm">{errors.titulo.message}</p>
            )}
          </div>

          {/* FECHAS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Fecha de inicio</label>
              <input
                type="date"
                {...register("fechaInicio", { required: "Seleccione una fecha" })}
                className="w-full p-2 border rounded mt-1"
              />
              {errors.fechaInicio && (
                <p className="text-red-500 text-sm">{errors.fechaInicio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Fecha de finalización</label>
              <input
                type="date"
                {...register("fechaFin", { required: "Seleccione una fecha" })}
                className="w-full p-2 border rounded mt-1"
              />
              {errors.fechaFin && (
                <p className="text-red-500 text-sm">{errors.fechaFin.message}</p>
              )}
            </div>
          </div>

          {/* MÁXIMO DE ÁREAS */}
          <div>
            <label className="block text-sm font-medium mb-1">Máximo de áreas por participante</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const value = getValues("maxAreas");
                  if (value > 1) setValue("maxAreas", value - 1);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                -
              </button>

              <input
                type="number"
                {...register("maxAreas", {
                  required: true,
                  min: {
                    value: 1,
                    message: "Debe ser al menos 1",
                  },
                })}
                className="w-16 text-center border rounded"
                min={1}
              />

              <button
                type="button"
                onClick={() => {
                  const value = getValues("maxAreas");
                  setValue("maxAreas", value + 1);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>
            {errors.maxAreas && (
              <p className="text-red-500 text-sm">{errors.maxAreas.message}</p>
            )}
          </div>

          {/* ESTADO */}
          <div>
            <label className="block text-sm font-medium">Estado</label>
            <select {...register("estado")} className="w-full p-2 border rounded mt-1">
              <option value="planificada">Planificada</option>
              <option value="abierta">Abierta</option>
            </select>
          </div>

          {/* BOTONES */}
          <div className="flex justify-end space-x-2">
            <button type="button" className="px-4 py-2 border rounded">
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded ${
                isValid ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!isValid}
            >
              Siguiente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevaConvocatoria;
