import api from './api';

export const createTutor = async (tutorData: {
  nombre: string;
  apellido: string;
  tipo_tutor: string;
  telefono: string;
  email: string;
}) => {
  try {
    const response = await api.post('/tutores', tutorData);
    return response.data;
  } catch (error) {
    console.error('Error creating tutor:', error);
    throw error;
  }
};

export const createCompetidor = async (competidorData: {
  nombre: string;
  apellido: string;
  email: string;
  ci: string;
  fecha_nacimiento: string;
  colegio: string;
  Id_grado: number;
  departamento: string;
  provincia: string;
}) => {
  try {
    // Verificar que todos los campos requeridos están presentes
    if (!competidorData.nombre || !competidorData.apellido || !competidorData.ci || 
        !competidorData.fecha_nacimiento || !competidorData.colegio || !competidorData.Id_grado) {
      throw new Error('Todos los campos obligatorios deben ser completados');
    }
    
    const response = await api.post('/competidores', competidorData);
    return response.data;
  } catch (error) {
    console.error('Error creating competidor:', error);
    // Extraer el mensaje de error del objeto de respuesta
    if (error.response && error.response.data) {
      const errorMessage = typeof error.response.data.message === 'object' 
        ? JSON.stringify(error.response.data.message) 
        : error.response.data.message || 'Error desconocido';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const createInscripcion = async (inscripcionData: {
  Id_competidor: number;
  Id_tutor: number;
  Id_area: number;
  Id_nivel: number;
  Id_grado: number;
  estado: string;
  fecha?: string;
}) => {
  try {
    const response = await api.post('/inscripciones', inscripcionData);
    return response.data;
  } catch (error) {
    console.error('Error creating inscripcion:', error);
    // Extraer el mensaje de error del objeto de respuesta
    if (error.response && error.response.data) {
      const errorMessage = typeof error.response.data.message === 'object' 
        ? JSON.stringify(error.response.data.message) 
        : error.response.data.message || 'Error desconocido';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

// Agregar un servicio para verificar si ya existe un competidor con el mismo CI
export const checkCompetidorExists = async (ci: string) => {
  try {
    const response = await api.get(`/competidores/check?ci=${ci}`);
    return response.data;
  } catch (error) {
    console.error('Error checking competidor:', error);
    return { exists: false };
  }
};
