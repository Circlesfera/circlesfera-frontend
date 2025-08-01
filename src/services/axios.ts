import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  timeout: 10000, // 10 segundos de timeout
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    // Solo agregar token si estamos en el cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios Error:', error);
    
    // Si es un error de autenticación (401), limpiar tokens
    if (error?.response?.status === 401) {
      // Limpiar tokens del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir a login si no estamos ya ahí
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Si es un error 500, también limpiar tokens por si acaso
    if (error?.response?.status === 500) {
      console.error('Error 500 del servidor - posible problema de autenticación');
      // Solo limpiar tokens si el error parece ser de autenticación
      if (error?.response?.data?.message?.includes('Token') || 
          error?.response?.data?.message?.includes('jwt') ||
          error?.response?.data?.message?.includes('autenticación')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check if server is running');
    }
    return Promise.reject(error);
  }
);

export default api;