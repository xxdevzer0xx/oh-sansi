// ./api.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Crear una instancia de Axios
const api: AxiosInstance = axios.create({
  baseURL: 'https://tu-api.com',  // Cambia esta URL por la base URL de tu API
  timeout: 5000,  // Tiempo máximo de espera para las solicitudes
  headers: {
    'Content-Type': 'application/json',
    // Aquí podrías agregar más headers si es necesario
  },
});
export default api; 
/*
// Manejo de respuestas exitosas
const handleResponse = (response: AxiosResponse) => {
  return response.data; // Aquí puedes agregar lógica extra si es necesario
};

// Manejo de errores
const handleError = (error: AxiosError) => {
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    console.error(`Error de respuesta: ${error.response.status}`);
    return Promise.reject(error.response.data);
  } else if (error.request) {
    // La solicitud fue realizada pero no hubo respuesta
    console.error('Error de solicitud:', error.request);
    return Promise.reject(error);
  } else {
    // Ocurrió un error en la configuración de la solicitud
    console.error('Error desconocido:', error.message);
    return Promise.reject(error);
  }
};

// Definir las funciones para hacer solicitudes a la API

// Función para realizar una solicitud GET
 const get = async <T>(url: string): Promise<T> => {
  try {
    const response = await api.get(url);
    return handleResponse(response);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

// Función para realizar una solicitud POST
const post = async <T, R>(url: string, data: T): Promise<R> => {
  try {
    const response = await api.post(url, data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

// Función para realizar una solicitud PUT
const put = async <T, R>(url: string, data: T): Promise<R> => {
  try {
    const response = await api.put(url, data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

// Función para realizar una solicitud DELETE
const delete = async <R>(url: string): Promise<R> => {
  try {
    const response = await api.delete(url);
    return handleResponse(response);
  } catch (error) {
    return handleError(error as AxiosError);
  }
};

*/