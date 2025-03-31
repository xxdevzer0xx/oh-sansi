import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Trash2,
  Edit,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react';
import type { CompetitionArea, RegistrationSummary, Level, Grade, AreaCost } from '../types';
import { StudentList } from '../components/admin/StudentList';
import { StudentDetails } from '../components/admin/StudentDetails';
import { API_BASE_URL } from '../config';
import { ModalPortal } from '../components/ModalPortal';
import { 
  createNivel, 
  createGrado, 
  createArea, 
  createCosto,
  getNiveles,
  getGrados, 
  getAreas,
  getCostos
} from '../services/apiServices';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function Admin() {
  // Estados para los modales
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [showAddArea, setShowAddArea] = useState(false);
  const [showAddAreaCost, setShowAddAreaCost] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationSummary | null>(null);
  
  // Estados para guardar datos de la API
  const [levels, setLevels] = useState<Level[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [areas, setAreas] = useState<CompetitionArea[]>([]);
  const [areaCosts, setAreaCosts] = useState<AreaCost[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationSummary[]>([]);
  const [stats, setStats] = useState<any>({
    totalInscripciones: 0,
    areasActivas: 0,
    ingresosTotales: 0,
    nuevosRegistros: 0,
    inscripcionesPorMes: [],
    distribucionPorArea: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simplificar los form states
  const [newLevel, setNewLevel] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newArea, setNewArea] = useState({ nombre: '', descripcion: '' });
  const [newAreaCost, setNewAreaCost] = useState({
    areaId: '',
    levelId: '',
    amount: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch niveles
        const niveleRes = await fetch(`${API_BASE_URL}/niveles`);
        const nivelesData = await niveleRes.json();
        if (nivelesData.status === 'success') {
          const formattedLevels = nivelesData.data.map((nivel: any) => ({
            id: nivel.Id_nivel.toString(),
            name: nivel.nombre
          }));
          setLevels(formattedLevels);
        }
        
        // Fetch grados
        const gradosRes = await fetch(`${API_BASE_URL}/grados`);
        const gradosData = await gradosRes.json();
        if (gradosData.status === 'success') {
          const formattedGrades = gradosData.data.map((grado: any) => ({
            id: grado.Id_grado.toString(),
            name: grado.nombre
          }));
          setGrades(formattedGrades);
        }
        
        // Fetch áreas
        const areasRes = await fetch(`${API_BASE_URL}/areas`);
        const areasData = await areasRes.json();
        if (areasData.status === 'success') {
          const formattedAreas = areasData.data.map((area: any) => ({
            id: area.Id_area.toString(),
            name: area.nombre,
            description: area.descripcion || '',
            level: '',
            cost: 0
          }));
          setAreas(formattedAreas);
        }
        
        // Fetch costos
        const costosRes = await fetch(`${API_BASE_URL}/costos`);
        const costosData = await costosRes.json();
        if (costosData.status === 'success') {
          const formattedCosts = costosData.data.map((costo: any) => ({
            id: costo.Id_costo.toString(),
            areaId: costo.Id_area.toString(),
            levelId: costo.Id_nivel.toString(),
            cost: costo.monto
          }));
          setAreaCosts(formattedCosts);
        }
        
        // Fetch inscripciones
        const inscripcionesRes = await fetch(`${API_BASE_URL}/inscripciones`);
        const inscripcionesData = await inscripcionesRes.json();
        if (inscripcionesData.status === 'success') {
          // Transformar los datos a formato RegistrationSummary
          const formattedRegistrations = inscripcionesData.data.map((inscripcion: any) => {
            const areaInfo = inscripcion.area ? {
              id: inscripcion.area.Id_area.toString(),
              name: inscripcion.area.nombre,
              description: inscripcion.area.descripcion || '',
              level: inscripcion.nivel ? inscripcion.nivel.nombre : '',
              cost: 0
            } : null;
            
            const areasArray = areaInfo ? [areaInfo] : [];
            
            return {
              id: inscripcion.Id_inscripcion.toString(),
              student: {
                name: `${inscripcion.competidor?.nombre} ${inscripcion.competidor?.apellido}` || 'Sin nombre',
                ci: inscripcion.competidor?.ci || '',
                birthDate: inscripcion.competidor?.fecha_nacimiento || '',
                email: inscripcion.competidor?.email || '',
                phone: '',
                areas: [inscripcion.Id_area.toString()],
                guardian: {
                  name: inscripcion.tutor?.nombre || '',
                  email: inscripcion.tutor?.email || '',
                  phone: inscripcion.tutor?.telefono || ''
                }
              },
              areas: areasArray,
              totalCost: 0,
              paymentStatus: inscripcion.estado.toLowerCase() === 'pagado' ? 'completed' : 'pending',
              registrationDate: inscripcion.fecha || new Date().toISOString()
            };
          });
          
          setRegistrations(formattedRegistrations);
        }
        
        // Fetch estadísticas del dashboard
        try {
          const statsRes = await fetch(`${API_BASE_URL}/dashboard/stats`);
          const statsData = await statsRes.json();
          
          if (statsData.status === 'success') {
            // Formatear datos para las gráficas
            const monthlyRegistrations = [
              { month: 'Enero', count: Math.floor(Math.random() * 30) },
              { month: 'Febrero', count: Math.floor(Math.random() * 30) },
              { month: 'Marzo', count: statsData.data.total_inscripciones || 0 }
            ];
            
            const areaDistribution = statsData.data.inscripciones_por_area || [];
            const formattedAreaDistribution = areaDistribution.map((item: any) => ({
              name: item.nombre,
              value: parseInt(item.total)
            }));
            
            setStats({
              totalInscripciones: statsData.data.total_inscripciones || 0,
              areasActivas: areas.length,
              ingresosTotales: "Calculando...",
              nuevosRegistros: statsData.data.total_inscripciones || 0,
              inscripcionesPorMes: monthlyRegistrations,
              distribucionPorArea: formattedAreaDistribution.length > 0 ? 
                formattedAreaDistribution : 
                [{ name: 'Sin datos', value: 1 }]
            });
          }
        } catch (statsError) {
          console.error('Error fetching stats:', statsError);
          // Continuar con stats por defecto
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Hubo un error al cargar los datos. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Funciones actualizadas para manejar los modales con llamadas API
  const handleAddLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    if (!newLevel.trim()) {
      setFormError('El nombre del nivel es requerido');
      return;
    }
    
    try {
      const response = await createNivel(newLevel);
      if (response.status === 'success') {
        setFormSuccess('Nivel creado exitosamente');
        setNewLevel('');
        setShowAddLevel(false);
        
        // Actualizar la lista de niveles
        const updatedLevels = await getNiveles();
        if (updatedLevels.status === 'success') {
          const formattedLevels = updatedLevels.data.map((nivel: any) => ({
            id: nivel.Id_nivel.toString(),
            name: nivel.nombre
          }));
          setLevels(formattedLevels);
        }
      } else {
        setFormError(response.message || 'Error al crear nivel');
      }
    } catch (error: any) {
      console.error('Error creating level:', error);
      setFormError(error.response?.data?.message || 'Error al conectar con el servidor');
    }
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    if (!newGrade.trim()) {
      setFormError('El nombre del grado es requerido');
      return;
    }
    
    try {
      const response = await createGrado(newGrade);
      if (response.status === 'success') {
        setFormSuccess('Grado creado exitosamente');
        setNewGrade('');
        setShowAddGrade(false);
        
        // Actualizar la lista de grados
        const updatedGrades = await getGrados();
        if (updatedGrades.status === 'success') {
          const formattedGrades = updatedGrades.data.map((grado: any) => ({
            id: grado.Id_grado.toString(),
            name: grado.nombre
          }));
          setGrades(formattedGrades);
        }
      } else {
        setFormError(response.message || 'Error al crear grado');
      }
    } catch (error: any) {
      console.error('Error creating grade:', error);
      setFormError(error.response?.data?.message || 'Error al conectar con el servidor');
    }
  };

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    if (!newArea.nombre.trim()) {
      setFormError('El nombre del área es requerido');
      return;
    }
    
    try {
      const response = await createArea(newArea.nombre, newArea.descripcion);
      if (response.status === 'success') {
        setFormSuccess('Área creada exitosamente');
        setNewArea({ nombre: '', descripcion: '' });
        setShowAddArea(false);
        
        // Actualizar la lista de áreas
        const updatedAreas = await getAreas();
        if (updatedAreas.status === 'success') {
          const formattedAreas = updatedAreas.data.map((area: any) => ({
            id: area.Id_area.toString(),
            name: area.nombre,
            description: area.descripcion || '',
            level: '',
            cost: 0
          }));
          setAreas(formattedAreas);
        }
      } else {
        setFormError(response.message || 'Error al crear área');
      }
    } catch (error: any) {
      console.error('Error creating area:', error);
      setFormError(error.response?.data?.message || 'Error al conectar con el servidor');
    }
  };

  const handleAddAreaCost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    if (!newAreaCost.areaId) {
      setFormError('Debe seleccionar un área');
      return;
    }
    
    if (!newAreaCost.levelId) {
      setFormError('Debe seleccionar un nivel');
      return;
    }
    
    if (!newAreaCost.amount || parseFloat(newAreaCost.amount) <= 0) {
      setFormError('El monto debe ser mayor a 0');
      return;
    }
    
    try {
      const response = await createCosto(
        newAreaCost.areaId, 
        newAreaCost.levelId, 
        parseFloat(newAreaCost.amount)
      );
      
      if (response.status === 'success') {
        setFormSuccess('Costo creado exitosamente');
        setNewAreaCost({
          areaId: '',
          levelId: '',
          amount: ''
        });
        setShowAddAreaCost(false);
        
        // Actualizar la lista de costos
        const updatedCosts = await getCostos();
        if (updatedCosts.status === 'success') {
          const formattedCosts = updatedCosts.data.map((costo: any) => ({
            id: costo.Id_costo.toString(),
            areaId: costo.Id_area.toString(),
            levelId: costo.Id_nivel.toString(),
            cost: costo.monto
          }));
          setAreaCosts(formattedCosts);
        }
      } else {
        setFormError(response.message || 'Error al crear costo');
      }
    } catch (error: any) {
      console.error('Error creating cost:', error);
      setFormError(
        error.response?.data?.message || 'Error al conectar con el servidor'
      );
    }
  };

  const StatCard = ({ icon: Icon, title, value, trend }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className="text-green-500 text-sm mt-1 flex items-center">
              <TrendingUp size={16} className="mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className="bg-blue-50 p-3 rounded-full">
          <Icon size={24} className="text-blue-600" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAddLevel(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              <Plus size={20} />
              <span>Nuevo Nivel</span>
            </button>
            <button
              onClick={() => setShowAddGrade(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              <Plus size={20} />
              <span>Nuevo Grado</span>
            </button>
            <button
              onClick={() => setShowAddArea(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              <Plus size={20} />
              <span>Nueva Área</span>
            </button>
            <button
              onClick={() => setShowAddAreaCost(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Plus size={20} />
              <span>Nuevo Costo</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Inscritos"
            value={stats.totalInscripciones}
            trend="+12.5% este mes"
          />
          <StatCard
            icon={BookOpen}
            title="Áreas Activas"
            value={areas.length}
          />
          <StatCard
            icon={DollarSign}
            title="Ingresos Totales"
            value="Bs. 23,400"
            trend="+8.2% este mes"
          />
          <StatCard
            icon={Users}
            title="Nuevos Registros"
            value={stats.nuevosRegistros}
            trend="+4.75% esta semana"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Inscripciones por Mes</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.inscripcionesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" name="Inscripciones" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Distribución por Área</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.distribucionPorArea}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.distribucionPorArea.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Levels Section */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Niveles</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {levels.length > 0 ? (
                  levels.map((level) => (
                    <div key={level.id} className="flex justify-between items-center">
                      <span>{level.name}</span>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit size={18} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteLevel(level.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No hay niveles disponibles</p>
                )}
              </div>
            </div>
          </div>

          {/* Grades Section */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Grados</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {grades.length > 0 ? (
                  grades.map((grade) => (
                    <div key={grade.id} className="flex justify-between items-center">
                      <span>{grade.name}</span>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit size={18} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteGrade(grade.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No hay grados disponibles</p>
                )}
              </div>
            </div>
          </div>

          {/* Area Costs Section */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Costos por Área y Nivel</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {areaCosts.length > 0 ? (
                  areaCosts.map((areaCost) => {
                    const area = areas.find(a => a.id === areaCost.areaId);
                    const level = levels.find(l => l.id === areaCost.levelId);
                    return (
                      <div key={areaCost.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{area?.name || 'Área desconocida'}</span>
                          <span className="text-gray-500 text-sm ml-2">({level?.name || 'Nivel desconocido'})</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">Bs. {areaCost.cost}</span>
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit size={18} />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteAreaCost(areaCost.id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center">No hay costos disponibles</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="mb-8">
          <StudentList 
            registrations={registrations}
            onViewDetails={setSelectedRegistration}
          />
        </div>

        {/* Modals */}
        <ModalPortal 
          title="Agregar Nuevo Nivel"
          isOpen={showAddLevel}
          onClose={() => setShowAddLevel(false)}
        >
          <form onSubmit={handleAddLevel} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                {formError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Nivel</label>
              <input 
                type="text"
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ej: Básico"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowAddLevel(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </ModalPortal>

        <ModalPortal 
          title="Agregar Nuevo Grado"
          isOpen={showAddGrade}
          onClose={() => setShowAddGrade(false)}
        >
          <form onSubmit={handleAddGrade} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                {formError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Grado</label>
              <input
                type="text"
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ej: Primero"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowAddGrade(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </ModalPortal>

        <ModalPortal 
          title="Agregar Nueva Área"
          isOpen={showAddArea}
          onClose={() => setShowAddArea(false)}
        >
          <form onSubmit={handleAddArea} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                {formError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Área</label>
              <input
                type="text"
                value={newArea.nombre}
                onChange={(e) => setNewArea({ ...newArea, nombre: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ej: Química"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                value={newArea.descripcion}
                onChange={(e) => setNewArea({ ...newArea, descripcion: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Descripción del área..."
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowAddArea(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </ModalPortal>

        <ModalPortal 
          title="Agregar Costo"
          isOpen={showAddAreaCost}
          onClose={() => setShowAddAreaCost(false)}
        >
          <form onSubmit={handleAddAreaCost} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                {formError}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Área</label>
              <select
                value={newAreaCost.areaId}
                onChange={(e) => setNewAreaCost({...newAreaCost, areaId: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seleccione un área</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Nivel</label>
              <select
                value={newAreaCost.levelId}
                onChange={(e) => setNewAreaCost({...newAreaCost, levelId: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seleccione un nivel</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Costo (Bs.)</label>
              <input
                type="number"
                value={newAreaCost.amount}
                onChange={(e) => setNewAreaCost({...newAreaCost, amount: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ej: 150"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowAddAreaCost(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </ModalPortal>

        {selectedRegistration && (
          <StudentDetails
            registration={selectedRegistration}
            onClose={() => setSelectedRegistration(null)}
          />
        )}
      </div>
    </div>
  );
}