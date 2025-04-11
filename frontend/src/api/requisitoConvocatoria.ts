import { RequisitoConvocatoria } from '../types/RequisitoConvocatoria';
import axiosInstance from './axiosInstance';

export const fetchConvocatorias = async (): Promise<{ id_convocatoria: number; nombre: string }[]> => {
  try {
    const response = await axiosInstance.get('/v1/convocatorias'); // Añade '/v1' a la ruta
    return response.data.data.map((convocatoria: any) => ({ // Accede a response.data.data y mapea
      id_convocatoria: convocatoria.id,
      nombre: convocatoria.nombre,
    }));
  } catch (error: any) {
    console.error('Error al obtener las convocatorias:', error);
    throw error;
  }
};

export const fetchRequisitosConvocatoria = async (
    idConvocatoria: number
  ): Promise<RequisitoConvocatoria[]> => {
    try {
      const response = await axiosInstance.get(`/v1/convocatorias/${idConvocatoria}/requisitos`);
      // La respuesta ya es el array, así que retornamos response.data directamente
      return response.data;
    } catch (error: any) {
      console.error(`Error al obtener los requisitos para la convocatoria ${idConvocatoria}:`, error);
      throw error;
    }
  };

export const saveRequisitosConvocatoria = async (
  idConvocatoria: number,
  requisitos: Omit<RequisitoConvocatoria, 'id' | 'created_at' | 'updated_at'>[]
): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/v1/convocatorias/${idConvocatoria}/requisitos`, requisitos, {
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '', // Si estás usando el CSRF de Laravel
      },
    });
    return response.data; // La estructura de la respuesta para POST puede variar
  } catch (error: any) {
    console.error('Error al guardar los requisitos:', error);
    throw error;
  }
};