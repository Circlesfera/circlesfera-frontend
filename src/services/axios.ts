import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Función para obtener token de forma segura
const getToken = () => {
  if (typeof window === 'undefined') {
    return null;
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
    
    // Solo loggear en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Axios interceptor - Configuración completa:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        token: token ? `Bearer ${token.substring(0, 20)}...` : 'No hay token'
      });
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Solo loggear en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('Axios interceptor - Token enviado:', `Bearer ${token.substring(0, 20)}...`);
        console.log('Axios interceptor - URL:', config.url);
        console.log('Axios interceptor - Método:', config.method);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('Axios interceptor - No hay token disponible');
      }
    }
    
    // Verificar que el header se configuró correctamente DESPUÉS de configurarlo
    if (process.env.NODE_ENV === 'development') {
      const authHeader = config.headers.Authorization;
      if (authHeader && typeof authHeader === 'string') {
        console.log('🔐 Header Authorization configurado:', authHeader.substring(0, 30) + '...');
      } else {
        console.log('❌ Header Authorization NO configurado - Token:', token ? 'Presente' : 'Ausente');
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
  (response) => {
    return response;
  },
  (error) => {
    // Si es un error de autenticación (401), limpiar tokens
    if (error?.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;