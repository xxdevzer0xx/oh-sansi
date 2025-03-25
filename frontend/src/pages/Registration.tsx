import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Student, CompetitionArea, RegistrationSummary, FormFieldConfig } from '../types';

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

/** Simular la base de datos*/
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

export function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Student>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldConfig, setFieldConfig] = useState<FormFieldConfig[]>([]);

  useEffect(() => {
    const savedConfig = localStorage.getItem('formFieldConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        const validConfig = defaultFieldConfig.map(defaultField => {
          const savedField = parsed.find((f: FormFieldConfig) => f.id === defaultField.id);
          return savedField || defaultField;
        });
        setFieldConfig(validConfig);
      } catch (error) {
        console.error('Error parsing config:', error);
        setFieldConfig(defaultFieldConfig);
      }
    } else {
      setFieldConfig(defaultFieldConfig);
    }
  }, []);

  const handleStudentFieldChange = (field: keyof Student, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuardianFieldChange = (field: keyof Student['guardian'], value: string) => {
    setFormData(prev => ({
      ...prev,
      guardian: {
        ...prev.guardian,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fieldConfig.forEach(field => {
      if (!field.is_active) return;
      
      if (field.is_required) {
        if (field.field_key.startsWith('guardian.')) {
          const guardianField = field.field_key.split('.')[1] as keyof Student['guardian'];
          if (!formData.guardian[guardianField]) {
            newErrors[field.field_key] = `${field.field_name} es requerido`;
          }
        } else {
          const studentField = field.field_key as keyof Student;
          if (!formData[studentField]) {
            newErrors[field.field_key] = `${field.field_name} es requerido`;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
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
    }
  };

  const handleAreaChange = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      areas: prev.areas.includes(areaId)
        ? prev.areas.filter(id => id !== areaId)
        : [...prev.areas, areaId],
    }));
  };

  const renderField = (fieldKey: string, label: string, type = 'text') => {
    const field = fieldConfig.find(f => f.field_key === fieldKey);
    if (!field || !field.is_active) return null;

    if (fieldKey.startsWith('guardian.')) {
      const guardianField = fieldKey.split('.')[1] as keyof Student['guardian'];
      return (
        <div>
          <label htmlFor={fieldKey} className="block text-sm font-medium text-gray-700">
            {label} {field.is_required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={type}
            id={fieldKey}
            value={formData.guardian[guardianField]}
            onChange={(e) => handleGuardianFieldChange(guardianField, e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors[fieldKey] ? 'border-red-300' : 'border-gray-300'
            } focus:border-blue-500 focus:ring-blue-500`}
          />
          {errors[fieldKey] && <p className="mt-1 text-sm text-red-600">{errors[fieldKey]}</p>}
        </div>
      );
    }

    const studentField = fieldKey as keyof Omit<Student, 'guardian' | 'areas'>;
    return (
      <div>
        <label htmlFor={fieldKey} className="block text-sm font-medium text-gray-700">
          {label} {field.is_required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          id={fieldKey}
          value={formData[studentField]}
          onChange={(e) => handleStudentFieldChange(studentField, e.target.value)}
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors[fieldKey] ? 'border-red-300' : 'border-gray-300'
          } focus:border-blue-500 focus:ring-blue-500`}
        />
        {errors[fieldKey] && <p className="mt-1 text-sm text-red-600">{errors[fieldKey]}</p>}
      </div>
    );
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Formulario de Inscripción</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Datos del Estudiante</h3>
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
              <h3 className="text-lg font-semibold text-gray-700">Áreas de Competencia</h3>
              <div className="space-y-2">
                {availableAreas.map((area) => (
                  <div key={area.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
              <h3 className="text-lg font-semibold text-gray-700">Datos del Tutor</h3>
              {renderField('guardian.name', 'Nombre Completo del Tutor')}
              {renderField('guardian.email', 'Correo Electrónico del Tutor', 'email')}
              {renderField('guardian.phone', 'Teléfono del Tutor', 'tel')}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
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