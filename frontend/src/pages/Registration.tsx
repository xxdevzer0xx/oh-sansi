import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Student, CompetitionArea, RegistrationSummary, FormFieldConfig } from '../types';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const initialFormData: Student = {
  name: '',
  ci: '',
  birthDate: '',
  email: '',
  phone: '',
  school: '',
  grade: '',
  city: '',
  province: '',
  areas: [],
  guardian: {
    name: '',
    email: '',
    phone: '',
  },
};

const availableAreas: CompetitionArea[] = [
  { 
    id: 'matematicas',
    name: 'Matemáticas',
    description: 'Resolución de problemas y pensamiento lógico',
    level: 'Intermedio',
    cost: 150
  },
  { 
    id: 'fisica',
    name: 'Física',
    description: 'Experimentación y comprensión del universo',
    level: 'Intermedio',
    cost: 150
  },
  { 
    id: 'informatica',
    name: 'Informática',
    description: 'Programación y desarrollo tecnológico',
    level: 'Intermedio',
    cost: 200
  },
];

export function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Student>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldConfig, setFieldConfig] = useState<FormFieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadFieldConfig();
  }, []);

  const loadFieldConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/registration/fields-config`);
      setFieldConfig(Array.isArray(response.data) ? response.data : []);
      setLoadError('');
    } catch (error) {
      console.error('Error loading field config:', error);
      setLoadError('No se pudo cargar la configuración del formulario');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentFieldChange = (field: keyof Student, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGuardianFieldChange = (field: keyof Student['guardian'], value: string) => {
    setFormData(prev => ({
      ...prev,
      guardian: {
        ...prev.guardian,
        [field]: value
      }
    }));
    if (errors[`guardian.${field}`]) {
      setErrors(prev => ({ ...prev, [`guardian.${field}`]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fieldConfig.forEach(field => {
      if (!field.is_active) return;
      
      if (field.is_required) {
        const fieldKey = field.field_key;
        if (fieldKey.startsWith('guardian.')) {
          const guardianField = fieldKey.split('.')[1] as keyof Student['guardian'];
          if (!formData.guardian[guardianField]) {
            newErrors[fieldKey] = `${field.field_name} es requerido`;
          }
        } else {
          const studentField = fieldKey as keyof Student;
          if (!formData[studentField]) {
            newErrors[fieldKey] = `${field.field_name} es requerido`;
          }
        }
      }
    });
    
    if (formData.areas.length === 0) {
      newErrors.areas = 'Debe seleccionar al menos un área';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(`${API_BASE_URL}/registration/submit`, formData);
        
        const selectedAreas = availableAreas.filter(area => formData.areas.includes(area.id));
        const totalCost = selectedAreas.reduce((sum, area) => sum + area.cost, 0);

        const registrationSummary: RegistrationSummary = {
          student: formData,
          areas: selectedAreas,
          totalCost,
          paymentStatus: 'pending',
          registrationDate: new Date().toISOString(),
        };

        navigate('/confirmacion', { state: { registration: registrationSummary } });
      } catch (error: any) {
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else {
          console.error('Error submitting form:', error);
          setErrors({ submit: 'Error al enviar el formulario. Por favor, intente nuevamente.' });
        }
      }
    }
  };

  const handleAreaChange = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      areas: prev.areas.includes(areaId)
        ? prev.areas.filter(id => id !== areaId)
        : [...prev.areas, areaId],
    }));
    if (errors.areas) {
      setErrors(prev => ({ ...prev, areas: '' }));
    }
  };

  const renderField = (fieldKey: string, label: string, type = 'text') => {
    if (!Array.isArray(fieldConfig)) return null;
    
    const field = fieldConfig.find(f => f.field_key === fieldKey);
    if (!field || !field.is_active) return null;

    if (fieldKey.startsWith('guardian.')) {
      const guardianField = fieldKey.split('.')[1] as keyof Student['guardian'];
      return (
        <div className="mb-4">
          <label htmlFor={fieldKey} className="block text-sm font-medium text-gray-700">
            {label} {field.is_required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={type}
            id={fieldKey}
            value={formData.guardian[guardianField]}
            onChange={(e) => handleGuardianFieldChange(guardianField, e.target.value)}
            className={`mt-1 block w-full rounded-md border ${errors[fieldKey] ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
          />
          {errors[fieldKey] && <p className="mt-1 text-sm text-red-600">{errors[fieldKey]}</p>}
        </div>
      );
    }

    const studentField = fieldKey as keyof Omit<Student, 'guardian' | 'areas'>;
    return (
      <div className="mb-4">
        <label htmlFor={fieldKey} className="block text-sm font-medium text-gray-700">
          {label} {field.is_required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          id={fieldKey}
          value={formData[studentField]}
          onChange={(e) => handleStudentFieldChange(studentField, e.target.value)}
          className={`mt-1 block w-full rounded-md border ${errors[fieldKey] ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
        />
        {errors[fieldKey] && <p className="mt-1 text-sm text-red-600">{errors[fieldKey]}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Cargando formulario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-600 mb-4">{loadError}</div>
            <button
              onClick={loadFieldConfig}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Formulario de Inscripción</h2>
          
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Datos del Estudiante</h3>
              {renderField('name', 'Nombre Completo')}
              {renderField('ci', 'Cédula de Identidad')}
              {renderField('birthDate', 'Fecha de Nacimiento', 'date')}
              {renderField('email', 'Correo Electrónico', 'email')}
              {renderField('phone', 'Teléfono', 'tel')}
              {renderField('school', 'Colegio')}
              {renderField('grade', 'Curso')}
              {renderField('city', 'Departamento')}
              {renderField('province', 'Provincia')}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Áreas de Competencia</h3>
              <div className="space-y-2">
                {availableAreas.map((area) => (
                  <div key={area.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={area.id}
                        checked={formData.areas.includes(area.id)}
                        onChange={() => handleAreaChange(area.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={area.id} className="ml-3">
                        <div className="text-sm font-medium text-gray-700">{area.name}</div>
                        <div className="text-sm text-gray-500">{area.description}</div>
                        <div className="text-xs text-gray-400">Nivel: {area.level}</div>
                      </label>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      Bs. {area.cost}
                    </div>
                  </div>
                ))}
                {errors.areas && <p className="mt-1 text-sm text-red-600">{errors.areas}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Datos del Tutor</h3>
              {renderField('guardian.name', 'Nombre Completo del Tutor')}
              {renderField('guardian.email', 'Correo Electrónico del Tutor', 'email')}
              {renderField('guardian.phone', 'Teléfono del Tutor', 'tel')}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Continuar con el Pago
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}