import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  timeout: 10000, // 10 segundos de timeout
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

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