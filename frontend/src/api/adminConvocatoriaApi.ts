import axiosInstance from './axiosInstance';


const API_BASE_URL = '/v1/admin';

/**
 * Obtiene todas las convocatorias activas
 */
export const getConvocatoriasActivas = async () => {
  try {
    const response = await axiosInstance.get('/v1/admin/convocatorias-activas');
    // Asegurar que se retorna la data independientemente de la estructura
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error al obtener convocatorias activas:', error);
    throw error;
  }
};

/**
 * Obtiene todas las áreas de competencia
 */
export const getAreasCompetencia = async () => {
  try {
    const response = await axiosInstance.get('/v1/admin/areas-competencia');
    // Asegurar que se retorna la data independientemente de la estructura
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error al obtener áreas de competencia:', error);
    throw error;
  }
};

/**
 * Obtiene todos los niveles de categoría
 */
export const getNivelesCategoria = async () => {
  try {
    const response = await axiosInstance.get('/v1/admin/niveles-categoria');
    // Asegurar que se retorna la data independientemente de la estructura
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error al obtener niveles de categoría:', error);
    throw error;
  }
};

/**
 * Obtiene todos los grados
 */
export const getGrados = async () => {
  try {
    const response = await axiosInstance.get('/v1/admin/grados');
    // Asegurar que se retorna la data independientemente de la estructura
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error al obtener grados:', error);
    throw error;
  }
};

/**
 * Crea una nueva convocatoria
 * @param data Datos de la convocatoria
 */
export const crearConvocatoria = async (data) => {
  try {
    console.log('Enviando datos de convocatoria:', data);
    const response = await axiosInstance.post('/v1/admin/convocatorias', data);
    console.log('Respuesta al crear convocatoria:', response.data);
    
    // Verificar si la respuesta contiene la estructura esperada
    if (response.data && response.data.data) {
      return response.data.data; // Para el caso de que la API devuelva {data: {...}}
    } else if (response.data && response.data.id_convocatoria) {
      return response.data; // Para el caso de que la API devuelva directamente el objeto
    } else {
      console.error('Respuesta inesperada al crear convocatoria:', response.data);
      throw new Error('La respuesta no contiene el ID de la convocatoria');
    }
  } catch (error) {
    console.error('Error al crear convocatoria:', error);
    throw error;
  }
};

/**
 * Asocia áreas y niveles a una convocatoria
 * @param data Datos de asociación
 */
export const asociarAreas = async (data) => {
  try {
    console.log('Enviando datos al servidor:', data);
    const response = await axiosInstance.post('/v1/admin/convocatorias/asociar-areas', data);
    return response.data;
  } catch (error) {
    console.error('Error completo al asociar áreas y niveles:', error);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    throw error;
  }
};

// --- Funciones para los Requisitos (asumiendo las rutas en Laravel) ---

// Obtiene los requisitos de una convocatoria específica
export const getConvocatoriaRequisitos = async (idConvocatoria: string) => {
  try {
      const response = await axiosInstance.get(`/api/v1/admin/convocatorias/${idConvocatoria}/requisitos`);
      return response.data;
  } catch (error: any) {
      if (error.response?.status === 404) {
          // Si no existen requisitos aún, devolvemos un array vacío
          return [];
      }
      throw error; // Otros errores sí los lanzamos
  }
};

// Actualiza un requisito existente
export const updateConvocatoriaRequisito = async (
  idConvocatoria: string,
  idRequisito: number,
  data: { es_obligatorio: boolean }
) => {
  try {
      const response = await axiosInstance.put(`${API_BASE_URL}/convocatorias/${idConvocatoria}/requisitos/${idRequisito}`, data);
      return response.data.data as Requisito; // Ajusta 'Requisito' si tienes una interfaz definida
  } catch (error: any) {
      console.error('Error al actualizar el requisito:', error);
      throw error;
  }
};

// Crea un nuevo requisito
export const crearConvocatoriaRequisito = async (
  idConvocatoria: string,
  data: { entidad: string; campo: string; es_obligatorio: boolean }
) => {
  try {
      const response = await axiosInstance.post(`${API_BASE_URL}/convocatorias/${idConvocatoria}/requisitos`, data);
      return response.data.data as Requisito; // Ajusta 'Requisito' si tienes una interfaz definida
  } catch (error: any) {
      console.error('Error al crear el requisito:', error);
      throw error;
  }
};