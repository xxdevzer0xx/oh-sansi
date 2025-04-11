import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Student, CompetitionArea, RegistrationSummary, Grade, Level } from '../types';
import axios from 'axios';
// import { API_BASE_URL } from '../config';
import { getGrados, getNiveles } from '../services/apiServices';

const  API_BASE_URL = 'http://127.0.0.1:8000';
const initialFormData: Student = {
  name: '',
  ci: '',
  birthDate: '',
  email: '',
  phone: '',
  colegio: '',
  gradeId: '',
  departamento: '',
  provincia: '',
  areas: [],
  guardian: {
    birthDate: '',
    ci: '',
    name: '',
    email: '',
    phone: '',
  },
};

const departamentos = [
  'La Paz',
  'Cochabamba',
  'Santa Cruz',
  'Oruro',
  'Potosí',
  'Chuquisaca',
  'Tarija',
  'Beni',
  'Pando',
];

export default function Registration() {

  const navigate = useNavigate();
  const [formData, setFormData] = useState<Student>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableAreas, setAvailableAreas] = useState<CompetitionArea[]>([]);
  const [availableGrades, setAvailableGrades] = useState<Grade[]>([]);
  const [availableLevels, setAvailableLevels] = useState<Level[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);




  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const areasResponse = await axios.get(`${API_BASE_URL}/areas`);
        const gradosResponse = await getGrados();
        const nivelesResponse = await getNiveles();

        if (areasResponse.data.status === 'success') {
          const areasData = areasResponse.data.data;

          const costosResponse = await axios.get(`${API_BASE_URL}/costos`);
          const costosData = costosResponse.data.status === 'success' ? costosResponse.data.data : [];

          let nivelesData = [];
          if (nivelesResponse.status === 'success') {
            nivelesData = nivelesResponse.data;
            const formattedLevels = nivelesData.map((nivel: any) => ({
              id: nivel.Id_nivel.toString(),
              name: nivel.nombre,
            }));
            setAvailableLevels(formattedLevels);
          }

          const areasWithCostos: CompetitionArea[] = areasData.map((area: any) => {
            const areaCosto = costosData.find((costo: any) => costo.Id_area === area.Id_area);
            const nivel = areaCosto && nivelesData.length > 0 ? nivelesData.find((n: any) => n.Id_nivel === areaCosto.Id_nivel) : null;

            return {
              id: area.Id_area.toString(),
              name: area.nombre,
              description: area.descripcion || 'Sin descripción',
              level: nivel ? nivel.nombre : 'No definido',
              cost: areaCosto ? parseFloat(areaCosto.monto) : 0,
            };
          });

          setAvailableAreas(areasWithCostos);

          if (gradosResponse.status === 'success') {
            const formattedGrades = gradosResponse.data.map((grado: any) => ({
              id: grado.Id_grado.toString(),
              name: grado.nombre,
            }));
            setAvailableGrades(formattedGrades);
          }

          setError(null);
        } else {
          throw new Error('No se pudieron cargar las áreas');
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Hubo un problema al cargar los datos. Por favor, intenta nuevamente.');

        setAvailableAreas([
          {
            id: 'matematicas',
            name: 'Matemáticas',
            description: 'Resolución de problemas y pensamiento lógico',
            level: 'Intermedio',
            cost: 150,
          },
          {
            id: 'fisica',
            name: 'Física',
            description: 'Experimentación y comprensión del universo',
            level: 'Intermedio',
            cost: 150,
          },
          {
            id: 'informatica',
            name: 'Informática',
            description: 'Programación y desarrollo tecnológico',
            level: 'Intermedio',
            cost: 200,
          },
        ]);

        setAvailableGrades([
          { id: '1', name: 'Primero' },
          { id: '2', name: 'Segundo' },
          { id: '3', name: 'Tercero' },
        ]);

        setAvailableLevels([
          { id: '1', name: 'Básico' },
          { id: '2', name: 'Intermedio' },
          { id: '3', name: 'Avanzado' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.ci) newErrors.ci = 'El CI es requerido';
    if (!formData.birthDate) newErrors.birthDate = 'La fecha de nacimiento es requerida';
    if (!formData.email) newErrors.email = 'El correo electrónico es requerido';
    if (!formData.phone) newErrors.phone = 'El teléfono es requerido';
    if (!formData.colegio) newErrors.colegio = 'La unidad educativa es requerida';
    if (!formData.gradeId) newErrors.gradeId = 'El grado es requerido';
    if (!formData.departamento) newErrors.departamento = 'El departamento es requerido';
    if (!formData.provincia) newErrors.provincia = 'La provincia es requerida';
    if (formData.areas.length === 0) newErrors.areas = 'Debe seleccionar al menos un área';
    if (selectedLevels.length === 0) newErrors.levels = 'Debe seleccionar al menos un nivel';

    if (!formData.guardian.name) newErrors['guardian.name'] = 'El nombre del tutor es requerido';
    if (!formData.guardian.email) newErrors['guardian.email'] = 'El correo del tutor es requerido';
    if (!formData.guardian.phone) newErrors['guardian.phone'] = 'El teléfono del tutor es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAreaChange = (areaId: string) => {
    setFormData((prev) => {
      const newAreas = prev.areas.includes(areaId)
        ? prev.areas.filter((id) => id !== areaId)
        : [...prev.areas, areaId];
      return {
        ...prev,
        areas: newAreas,
      };
    });
  };

  const handleLevelChange = (levelId: string) => {
    setSelectedLevels((prev) =>
      prev.includes(levelId) ? prev.filter((id) => id !== levelId) : [...prev, levelId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const selectedAreas = availableAreas.filter((area) => formData.areas.includes(area.id));
        const selectedLevelObjects = availableLevels.filter((level) => selectedLevels.includes(level.id));
        const totalCost = calculateTotalCost(selectedAreas, selectedLevelObjects);

        const competidorData = {
          nombre: formData.name.split(' ')[0] || formData.name,
          apellido: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          ci: formData.ci,
          fecha_nacimiento: formData.birthDate,
          colegio: formData.colegio,
          Id_grado: parseInt(formData.gradeId),
          departamento: formData.departamento,
          provincia: formData.provincia,
        };

        const competidorResponse = await axios.post(`${API_BASE_URL}/competidores`, competidorData);

        if (competidorResponse.data.status === 'success') {
          const tutorData = {
            nombre: formData.guardian.name.split(' ')[0] || formData.guardian.name,
            apellido: formData.guardian.name.split(' ').slice(1).join(' ') || '',
            tipo_tutor: 'Familiar',
            telefono: formData.guardian.phone,
            email: formData.guardian.email,
          };

          const tutorResponse = await axios.post(`${API_BASE_URL}/tutores`, tutorData);

          if (tutorResponse.data.status === 'success') {
            const inscripciones = [];

            for (const areaId of formData.areas) {
              for (const levelId of selectedLevels) {
                const inscripcionData = {
                  Id_competidor: competidorResponse.data.data.Id_competidor,
                  Id_tutor: tutorResponse.data.data.Id_tutor,
                  Id_area: areaId,
                  Id_nivel: levelId,
                  Id_grado: formData.gradeId,
                  estado: 'Pendiente',
                };

                const inscripcionResponse = await axios.post(`${API_BASE_URL}/inscripciones`, inscripcionData);
                inscripciones.push(inscripcionResponse.data.data);
              }
            }
            const levels : Level[] = selectedLevels.map(level => {
              let lev: Level = {id:level, name:level};
              return lev;
            });
            const registrationSummary: RegistrationSummary = {
              id: inscripciones.length > 0 ? inscripciones[0].Id_inscripcion : 'temp-id',
              student: formData,
              areas: selectedAreas.map((area) => ({
                ...area,
                level: availableLevels.find((lvl) => selectedLevels.includes(lvl.id))?.name || area.level,
              })),
              totalCost:totalCost,
              paymentStatus: 'pending',
              registrationDate: new Date().toISOString(),
              selectedLevels: levels,
              olympiadId: "1",

            };


            navigate('/confirmacion', { state: { registration: registrationSummary } });
          }
        }
      } catch (error) {
        console.error('Error al procesar la inscripción:', error);
        alert('Hubo un error al procesar tu inscripción. Por favor, intenta nuevamente.');
      }
    }
  };

  const calculateTotalCost = (areas: CompetitionArea[], levels: Level[]) => {
    let total = 0;
    for (const area of areas) {
      total += area.cost * levels.length;
    }
    return total;
  };

  if (loading) {
    return (
      <div className="py-12 bg-gray-50 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando áreas disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Formulario de Inscripción</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Datos del Estudiante</h3>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="ci" className="block text-sm font-medium text-gray-700">
                  Cédula de Identidad
                </label>
                <input
                  type="text"
                  id="ci"
                  value={formData.ci}
                  onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.ci ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                />
                {errors.ci && <p className="mt-1 text-sm text-red-600">{errors.ci}</p>}
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  id="birthDate"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.birthDate ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                />
                {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="colegio" className="block text-sm font-medium text-gray-700">
                  Unidad Educativa
                </label>
                <input
                  type="text"
                  id="colegio"
                  value={formData.colegio}
                  onChange={(e) => setFormData({ ...formData, colegio: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.colegio ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                  placeholder="Nombre de tu unidad educativa"
                />
                {errors.colegio && <p className="mt-1 text-sm text-red-600">{errors.colegio}</p>}
              </div>

              <div>
                <label htmlFor="gradeId" className="block text-sm font-medium text-gray-700">
                  Grado
                </label>
                <select
                  id="gradeId"
                  value={formData.gradeId}
                  onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.gradeId ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                >
                  <option value="">Selecciona un grado</option>
                  {availableGrades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
                {errors.gradeId && <p className="mt-1 text-sm text-red-600">{errors.gradeId}</p>}
              </div>

              <div>
                <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">
                  Departamento
                </label>
                <select
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.departamento ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                >
                  <option value="">Selecciona un departamento</option>
                  {departamentos.map((depto) => (
                    <option key={depto} value={depto}>
                      {depto}
                    </option>
                  ))}
                </select>
                {errors.departamento && <p className="mt-1 text-sm text-red-600">{errors.departamento}</p>}
              </div>

              <div>
                <label htmlFor="provincia" className="block text-sm font-medium text-gray-700">
                  Provincia
                </label>
                <input
                  type="text"
                  id="provincia"
                  value={formData.provincia}
                  onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.provincia ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                  placeholder="Nombre de la provincia"
                />
                {errors.provincia && <p className="mt-1 text-sm text-red-600">{errors.provincia}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Áreas de Competencia</h3>
              <div className="space-y-4">
                {availableAreas.map((area) => (
                  <div key={area.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`area-${area.id}`}
                          checked={formData.areas.includes(area.id)}
                          onChange={() => handleAreaChange(area.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`area-${area.id}`} className="ml-3">
                          <div className="text-sm font-medium text-gray-700">{area.name}</div>
                          <div className="text-sm text-gray-500">{area.description}</div>
                        </label>
                      </div>
                      <div className="text-sm font-medium text-gray-900">Bs. {area.cost}</div>
                    </div>
                  </div>
                ))}
                {errors.areas && <p className="mt-1 text-sm text-red-600">{errors.areas}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Niveles de Competencia</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {availableLevels.map((level) => (
                  <div key={level.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`level-${level.id}`}
                        checked={selectedLevels.includes(level.id)}
                        onChange={() => handleLevelChange(level.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`level-${level.id}`} className="ml-3 text-sm font-medium text-gray-700">
                        {level.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              {errors.levels && <p className="mt-1 text-sm text-red-600">{errors.levels}</p>}
            </div>

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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guardian: { ...formData.guardian, name: e.target.value },
                    })
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors['guardian.name'] ? 'border-red-300' : ''
                  }`}
                />
                {errors['guardian.name'] && <p className="mt-1 text-sm text-red-600">{errors['guardian.name']}</p>}
              </div>

              <div>
                <label htmlFor="guardianEmail" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="guardianEmail"
                  value={formData.guardian.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guardian: { ...formData.guardian, email: e.target.value },
                    })
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors['guardian.email'] ? 'border-red-300' : ''
                  }`}
                />
                {errors['guardian.email'] && <p className="mt-1 text-sm text-red-600">{errors['guardian.email']}</p>}
              </div>

              <div>
                <label htmlFor="guardianPhone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="guardianPhone"
                  value={formData.guardian.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guardian: { ...formData.guardian, phone: e.target.value },
                    })
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors['guardian.phone'] ? 'border-red-300' : ''
                  }`}
                />
                {errors['guardian.phone'] && <p className="mt-1 text-sm text-red-600">{errors['guardian.phone']}</p>}
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