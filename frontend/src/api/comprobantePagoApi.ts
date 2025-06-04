import axiosInstance from './axiosInstance';
import axios from 'axios';

/**
 * Verifica si existe una orden de pago con el código especificado
 * @param codigo Código único de la orden
 */
export const verificarCodigoOrden = async (codigo: string) => {
  try {
    const response = await axiosInstance.get(`/orden/by-code/${codigo}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error al verificar el código:', error);
    throw error;
  }
};

/**
 * Sube un comprobante de pago para una orden de pago (backend antiguo)
 * @param formData FormData con los datos del comprobante y el archivo
 */
export const subirComprobantePago = async (formData: FormData) => {
  try {
    const response = await axiosInstance.post('/v1/comprobantes-pago/ocr/verificar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`Progreso de carga: ${percentCompleted}%`);
      }
    });

    return response.data?.data || response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error al subir el comprobante (respuesta):', error.response.data);
      throw new Error(error.response.data.message || 'Error al subir el comprobante');
    } else {
      console.error('Error inesperado al subir el comprobante:', error);
      throw new Error('Error inesperado al subir el comprobante');
    }
  }
};

/**
 * Verifica un comprobante mediante OCR en el backend actualizado
 * @param formData FormData que incluye el archivo PDF
 */
export const verificarComprobanteOCR = async (formData: FormData) => {
  try {
    const response = await axiosInstance.post('/api/verificar-comprobante-ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`Progreso de OCR: ${percentCompleted}%`);
      }
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error en verificación OCR (respuesta):', error.response.data);
      throw new Error(error.response.data.message || 'Error en verificación OCR');
    } else {
      console.error('Error inesperado en verificación OCR:', error);
      throw new Error('Error inesperado en verificación OCR');
    }
  }
};
