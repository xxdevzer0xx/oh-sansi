import React, { useState, useEffect } from 'react';
import type { FormFieldConfig } from '../types';

/*Para simular la base de datos*/
const defaultFieldConfig: FormFieldConfig[] = [
  { id: '1', field_name: 'Nombre Completo', field_key: 'name', is_required: true, is_active: true, category: 'student' },
  { id: '2', field_name: 'Cédula de Identidad', field_key: 'ci', is_required: true, is_active: true, category: 'student' },
  { id: '3', field_name: 'Fecha de Nacimiento', field_key: 'birthDate', is_required: true, is_active: true, category: 'student' },
  { id: '4', field_name: 'Correo Electrónico', field_key: 'email', is_required: true, is_active: true, category: 'student' },
  { id: '5', field_name: 'Teléfono', field_key: 'phone', is_required: true, is_active: true, category: 'student' },
  { id: '6', field_name: 'Colegio', field_key: 'school', is_required: false, is_active: true, category: 'student' },
  { id: '7', field_name: 'Curso', field_key: 'grade', is_required: false, is_active: true, category: 'student' },
  { id: '8', field_name: 'Departamento', field_key: 'city', is_required: false, is_active: true, category: 'student' },
  { id: '9', field_name: 'Provincia', field_key: 'province', is_required: false, is_active: true, category: 'student' },
  { id: '10', field_name: 'Nombre del Tutor', field_key: 'guardian.name', is_required: true, is_active: true, category: 'guardian' },
  { id: '11', field_name: 'Correo del Tutor', field_key: 'guardian.email', is_required: true, is_active: true, category: 'guardian' },
  { id: '12', field_name: 'Teléfono del Tutor', field_key: 'guardian.phone', is_required: true, is_active: true, category: 'guardian' },
];

export function FormFieldsAdmin() {
  const [fields, setFields] = useState<FormFieldConfig[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = localStorage.getItem('formFieldConfig');
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          const mergedConfig = defaultFieldConfig.map(defaultField => {
            const savedField = parsed.find((f: FormFieldConfig) => f.id === defaultField.id);
            return savedField || defaultField;
          });
          setFields(mergedConfig);
        } catch (error) {
          console.error('Error al cargar configuración:', error);
          setFields(defaultFieldConfig);
        }
      } else {
        setFields(defaultFieldConfig);
      }
    };
    loadConfig();
  }, []);

  const toggleFieldSetting = (id: string, field: 'is_required' | 'is_active') => {
    setFields(prev => prev.map(f => 
      f.id === id ? { ...f, [field]: !f[field] } : f
    ));
  };

  const saveConfiguration = () => {

    const hasRequiredFields = fields.some(f => f.is_active && f.is_required);
    
    if (!hasRequiredFields) {
      setError('Debe tener al menos un campo activo y obligatorio');
      return;
    }

    localStorage.setItem('formFieldConfig', JSON.stringify(fields));
    setSuccess('Configuración guardada correctamente');
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración de Campos Obligatorios</h2>
          
          {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
          {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>}

          <div className="mb-6">
            <button
              onClick={saveConfiguration}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Guardar Configuración
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Campos del Estudiante</h3>
            {fields
              .filter(field => field.category === 'student')
              .map(field => (
                <div key={field.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={field.is_active}
                      onChange={() => toggleFieldSetting(field.id, 'is_active')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className={!field.is_active ? 'text-gray-400' : 'text-gray-700'}>
                      {field.field_name}
                    </span>
                  </div>
                  <label className="flex items-center space-x-2">
                    <span className="text-gray-700">Obligatorio</span>
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

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Campos del Tutor</h3>
            {fields
              .filter(field => field.category === 'guardian')
              .map(field => (
                <div key={field.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={field.is_active}
                      onChange={() => toggleFieldSetting(field.id, 'is_active')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className={!field.is_active ? 'text-gray-400' : 'text-gray-700'}>
                      {field.field_name}
                    </span>
                  </div>
                  <label className="flex items-center space-x-2">
                    <span className="text-gray-700">Obligatorio</span>
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
  );
}