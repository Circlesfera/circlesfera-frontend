import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  timeout: 10000, // 10 segundos de timeout
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Función para obtener token de forma segura
const getToken = () => {
  if (typeof window === 'undefined') {
    return null; // No hay localStorage en SSR
  }
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    return null;
  }
};

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Limpiar tokens del localStorage solo en el cliente
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirigir a login si no estamos ya ahí
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Si es un error 500, también limpiar tokens por si acaso
    if (error?.response?.status === 500) {
      console.error('Error 500 del servidor - posible problema de autenticación');
      // Solo limpiar tokens si el error parece ser de autenticación
      if (error?.response?.data?.message?.includes('Token') || 
          error?.response?.data?.message?.includes('jwt') ||
          error?.response?.data?.message?.includes('autenticación')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
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