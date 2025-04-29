import React, { useState } from 'react';
import axios from 'axios'; 

export default function CrearArea() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const validarNombre = (valor: string) => {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,30}$/;
    return regex.test(valor);
  };

  const validarDescripcion = (valor: string) => {
    return valor.length <= 200;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validarNombre(nombre)) {
      setError('El nombre del área debe tener máximo 30 caracteres, sin números ni caracteres especiales.');
      return;
    }

    if (!validarDescripcion(descripcion)) {
      setError('La descripción no debe superar los 200 caracteres.');
      return;
    }

    setError('');
    setExito('');

    try {
      await axios.post('http://localhost:8000/api/areas', {
        nombre_area: nombre,
        descripcion: descripcion
      });

      setExito('Área creada exitosamente.');
      setNombre('');
      setDescripcion('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el área.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4">Crear Nueva Área</h2>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {exito && <p className="text-green-600 text-sm mb-3">{exito}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Nombre del Área</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
            maxLength={30}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
            maxLength={200}
            //required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Crear Área
        </button>
      </form>
    </div>
  );
}
