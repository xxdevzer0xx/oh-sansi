import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Student, CompetitionArea, RegistrationSummary } from '../types';

const axios = window.axios;

// Define types for the dropdown options
interface DropdownOption {
  id: number;
  name: string;
}
export function Registration() {

  const [firstDropdownValue, setFirstDropdownValue] = useState<string>('');
  const [secondDropdownValue, setSecondDropdownValue] = useState<string>('');
  const [secondDropdownOptions, setSecondDropdownOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');


  const firstOptions: string[] = [
    '1 de primaria',
    '2 de primaria',
    '3 de primaria',
    '4 de primaria',
    '5 de primaria',
    '6 de primaria',
    '1 de secundaria',
    '2 de secundaria',
    '3 de secundaria',
    '4 de secundaria',
    '5 de secundaria',
    '6 de secundaria',
  ];

  // Handler for the first dropdown change
  const handleFirstDropdownChange = async (e: React.ChangeEvent<HTMLSelectElement>): Promise<void> => {
    const selectedValue = e.target.value;
    setFirstDropdownValue(selectedValue);
    setSecondDropdownValue(''); // Reset the second dropdown when first changes

    if (selectedValue) {
      // Fetch options for the second dropdown based on the first dropdown selection
      setLoading(true);
      setError('');

      try {
        // Example API call, replace with your actual API endpoint
        const response = await axios.get(`http://localhost:5173/api/areas-by-course/${selectedValue}`);

        // Assume response.data is an array of objects with 'id' and 'name'
        setSecondDropdownOptions(response.data);
      } catch (err) {
        setError('Failed to load options');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handler for the second dropdown change
  const handleSecondDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSecondDropdownValue(e.target.value);
  };







  const initialFormData: Student = {
    name: '',
    ci: '',
    birthDate: '',
    email: '',
    phone: '',
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

  const navigate = useNavigate();
  const [formData, setFormData] = useState<Student>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.ci) newErrors.ci = 'El CI es requerido';
    if (!formData.birthDate) newErrors.birthDate = 'La fecha de nacimiento es requerida';
    if (!formData.email) newErrors.email = 'El correo electrónico es requerido';
    if (!formData.phone) newErrors.phone = 'El teléfono es requerido';
    if (formData.areas.length === 0) newErrors.areas = 'Debe seleccionar al menos un área';

    // Validate guardian information
    if (!formData.guardian.name) newErrors['guardian.name'] = 'El nombre del tutor es requerido';
    if (!formData.guardian.email) newErrors['guardian.email'] = 'El correo del tutor es requerido';
    if (!formData.guardian.phone) newErrors['guardian.phone'] = 'El teléfono del tutor es requerido';

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

export default function Registration() {
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Formulario de Inscripción</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos del Estudiante */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Datos del Estudiante</h3>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombres
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${errors.name ? 'border-red-300' : 'border-gray-300'
                    } focus:border-blue-500 focus:ring-blue-500`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div className="flex flex-col sm:flex-row gap-10 items-center">
                <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Apellido Paterno
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.name ? 'border-red-300' : 'border-gray-300'
                      } focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.name ? 'border-red-300' : 'border-gray-300'
                      } focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

              </div>
              <div className="flex flex-col sm:flex-row gap-10 items-center">

                <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                  <label htmlFor="ci" className="block text-sm font-medium text-gray-700">
                    Cédula de Identidad
                  </label>
                  <input
                    type="text"
                    id="ci"
                    value={formData.ci}
                    onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.ci ? 'border-red-300' : 'border-gray-300'
                      } focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.ci && <p className="mt-1 text-sm text-red-600">{errors.ci}</p>}
                </div>

                <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.birthDate ? 'border-red-300' : 'border-gray-300'
                      } focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-10 items-center">
                <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.email ? 'border-red-300' : 'border-gray-300'
                      } focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.phone ? 'border-red-300' : 'border-gray-300'
                      } focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

              </div>

              <div className="flex flex-col sm:flex-row gap-10 items-center">
                <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Colegio/Unidad Educativa
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.email ? 'border-red-300' : 'border-gray-300'
                      } focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className={`mt-1 block w-full rounded-md shadow-sm`}>

                  <select value={firstDropdownValue} onChange={handleFirstDropdownChange}
                  >
                    <option value="">Seleccione un curso</option>
                    {firstOptions.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>

                </div>

              </div>


            </div>

            {/* Áreas de Competencia */}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Áreas de Competencia</h3>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-10 items-center">
                  <div className={`mt-1 block w-full rounded-md shadow-sm`}>

                    <select value={firstDropdownValue} onChange={handleFirstDropdownChange}
                    >
                      <option value="">Seleccione un curso</option>
                      {firstOptions.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>

                  </div>
                  <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                    <select
                      className={`mt-1 block w-full rounded-md shadow-sm`}
                      value={secondDropdownValue}
                      onChange={handleSecondDropdownChange}
                      disabled={!firstDropdownValue || loading}
                    >
                      <option value="">Select una materia</option>
                      {loading && <option>Loading...</option>}
                      {error && <option>{error}</option>}
                      {secondDropdownOptions.length > 0 &&
                        secondDropdownOptions.map((option) => (
                          <option key={option.id} value={option.name}>{option.name}</option>
                        ))}
                    </select>
                    {errors.areas && <p className="mt-1 text-sm text-red-600">{errors.areas}</p>}
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-700">Datos del Tutor Academico ( Opcional ) </h3>


            <div className="space-y-4">
              <div className="space-y-2">
                <div>
                  <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700">
                    Nombres
                  </label>
                  <input
                    type="text"
                    id="guardianName"
                    value={formData.guardian.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      guardian: { ...formData.guardian, name: e.target.value }
                    })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors['guardian.name'] ? 'border-red-300' : ''
                      }`}
                  />
                  {errors['guardian.name'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['guardian.name']}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-10 items-center">
                  <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Apellido Paterno
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`mt-1 block w-full rounded-md shadow-sm ${errors.name ? 'border-red-300' : 'border-gray-300'
                        } focus:border-blue-500 focus:ring-blue-500`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Apellido Materno
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`mt-1 block w-full rounded-md shadow-sm ${errors.name ? 'border-red-300' : 'border-gray-300'
                        } focus:border-blue-500 focus:ring-blue-500`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-10 items-center">
                  <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                    <label htmlFor="guardianEmail" className="block text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="guardianEmail"
                      value={formData.guardian.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        guardian: { ...formData.guardian, email: e.target.value }
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors['guardian.email'] ? 'border-red-300' : ''
                        }`}
                    />
                    {errors['guardian.email'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['guardian.email']}</p>
                    )}
                  </div>





                  <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                    <label htmlFor="guardianPhone" className="block text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="guardianPhone"
                      value={formData.guardian.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        guardian: { ...formData.guardian, phone: e.target.value }
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors['guardian.phone'] ? 'border-red-300' : ''
                        }`}
                    />
                    {errors['guardian.phone'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['guardian.phone']}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Datos del Tutor */}
            <div className="space-y-4">

              <h3 className="text-lg font-semibold text-gray-700">Datos del Tutor</h3>

              <div>
                <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="guardianName"
                  value={formData.guardian.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    guardian: { ...formData.guardian, name: e.target.value }
                  })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors['guardian.name'] ? 'border-red-300' : ''
                    }`}
                />
                {errors['guardian.name'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['guardian.name']}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-10 items-center">
                <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Apellido Paterno
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.name ? 'border-red-300' : 'border-gray-300'
                      } focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.name ? 'border-red-300' : 'border-gray-300'
                      } focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

              </div>
              <div className="flex flex-col sm:flex-row gap-10 items-center">

                <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                  <label htmlFor="guardianEmail" className="block text-sm font-medium text-gray-700">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="guardianEmail"
                    value={formData.guardian.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      guardian: { ...formData.guardian, email: e.target.value }
                    })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors['guardian.email'] ? 'border-red-300' : ''
                      }`}
                  />
                  {errors['guardian.email'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['guardian.email']}</p>
                  )}
                </div>

                <div className={`mt-1 block w-full rounded-md shadow-sm`}>
                  <label htmlFor="guardianPhone" className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="guardianPhone"
                    value={formData.guardian.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      guardian: { ...formData.guardian, phone: e.target.value }
                    })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors['guardian.phone'] ? 'border-red-300' : ''
                      }`}
                  />
                  {errors['guardian.phone'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['guardian.phone']}</p>
                  )}
                </div>
              </div>
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