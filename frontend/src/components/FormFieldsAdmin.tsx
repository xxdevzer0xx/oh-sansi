import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FormFieldConfig {
  id: number;
  field_name: string;
  field_key: string;
  is_required: boolean;
  is_active: boolean;
  category: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export function FormFieldsAdmin() {
  const [fields, setFields] = useState<FormFieldConfig[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/campos`);
      
      if (!Array.isArray(response.data)) {
        throw new Error('Formato de respuesta inesperado');
      }

      // Transformar los datos para asegurar la estructura correcta
      const transformedFields = response.data.map((campo: any) => ({
        id: campo.id_campo || campo.id,
        field_name: campo.nombre_campo || campo.field_name,
        field_key: campo.etiqueta || campo.field_key,
        is_required: Boolean(campo.obligatorio ?? campo.is_required),
        is_active: Boolean(campo.activo ?? campo.is_active),
        category: campo.categoria || campo.category
      }));

      setFields(transformedFields);
    } catch (error: any) {
      console.error('Error al cargar campos:', error);
      let errorMessage = 'Error al cargar la configuración de campos';
      if (error.response) {
        errorMessage += `: ${error.response.status} ${error.response.statusText}`;
        if (error.response.data?.message) {
          errorMessage += ` - ${error.response.data.message}`;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleFieldSetting = (id: number, field: 'is_required' | 'is_active') => {
    setFields(prev => prev.map(f => 
      f.id === id ? { ...f, [field]: !f[field] } : f
    ));
  };

  const saveConfiguration = async () => {
    const hasRequiredFields = fields.some(f => f.is_active && f.is_required);
    
    if (!hasRequiredFields) {
      setError('Debe tener al menos un campo activo y obligatorio');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const dataToSend = fields.map(field => ({
        id: field.id,
        is_required: field.is_required,
        is_active: field.is_active
      }));

      const response = await axios.post(`${API_BASE_URL}/campos/update-config`, dataToSend);
      
      if (response.data.message) {
        setSuccess(response.data.message);
      } else {
        setSuccess('Configuración actualizada correctamente');
      }
      
      // Recargar los campos para asegurar sincronización
      await loadFields();
    } catch (error: any) {
      console.error('Error al guardar configuración:', error);
      let errorMessage = 'Error al guardar la configuración';
      if (error.response) {
        errorMessage += `: ${error.response.status} ${error.response.statusText}`;
        if (error.response.data?.error) {
          errorMessage += ` - ${error.response.data.error}`;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && fields.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Cargando configuración de campos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Administración de Campos del Formulario</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={loadFields}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Recargar Campos
          </button>
          
          <button
            onClick={saveConfiguration}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
              Campos del Estudiante
            </h3>
            <div className="space-y-3">
              {fields
                .filter(field => field.category === 'student')
                .map(field => (
                  <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={field.is_active}
                        onChange={() => toggleFieldSetting(field.id, 'is_active')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className={`${!field.is_active ? 'text-gray-400' : 'text-gray-700'}`}>
                        {field.field_name}
                      </span>
                    </div>
                    <label className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Obligatorio</span>
                      <input
                        type="checkbox"
                        checked={field.is_required}
                        onChange={() => toggleFieldSetting(field.id, 'is_required')}
                        disabled={!field.is_active}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                ))}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
              Campos del Tutor
            </h3>
            <div className="space-y-3">
              {fields
                .filter(field => field.category === 'guardian')
                .map(field => (
                  <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={field.is_active}
                        onChange={() => toggleFieldSetting(field.id, 'is_active')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className={`${!field.is_active ? 'text-gray-400' : 'text-gray-700'}`}>
                        {field.field_name}
                      </span>
                    </div>
                    <label className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Obligatorio</span>
                      <input
                        type="checkbox"
                        checked={field.is_required}
                        onChange={() => toggleFieldSetting(field.id, 'is_required')}
                        disabled={!field.is_active}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}