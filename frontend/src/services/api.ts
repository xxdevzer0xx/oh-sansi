import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Set timeout to avoid hanging requests
  timeout: 30000 // 30 seconds
});

// Add request interceptor with improved debugging
api.interceptors.request.use(config => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  if (config.data) {
    console.log('Request Data:', JSON.stringify(config.data, null, 2));
  }
  return config;
}, error => {
  console.error('API Request Error:', error.message);
  return Promise.reject(error);
});

// Add response interceptor with improved error handling
api.interceptors.response.use(response => {
  console.log('API Response:', response.status, response.config.url);
  return response;
}, error => {
  console.error('API Error:', error.message);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response Status:', error.response.status);
    console.error('Response Data:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request setup error:', error.message);
  }
  
  return Promise.reject(error);
});

export default api;
