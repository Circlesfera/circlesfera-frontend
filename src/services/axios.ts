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
    
    // Debug: mostrar la URL que se está construyendo
    console.log('🔍 Axios Request Debug:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullUrl: `${config.baseURL}${config.url}`,
      headers: config.headers,
      hasToken: !!token,
      baseURL: config.baseURL
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Axios Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    // Debug: mostrar respuesta exitosa
    console.log('✅ Axios Response Debug:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  (error) => {
    // Debug: mostrar error detallado con más información
    const errorInfo = {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      url: error?.config?.url,
      method: error?.config?.method?.toUpperCase(),
      message: error?.response?.data?.message || error?.message,
      fullError: error,
      // Información adicional para debug
      hasResponse: !!error?.response,
      hasRequest: !!error?.request,
      code: error?.code,
      name: error?.name,
      stack: error?.stack,
      // Configuración de la petición
      config: {
        baseURL: error?.config?.baseURL,
        url: error?.config?.url,
        method: error?.config?.method,
        headers: error?.config?.headers,
        timeout: error?.config?.timeout
      }
    };
    
    console.error('❌ Axios Error Debug:', errorInfo);
    
    // Si el error está vacío, mostrar información adicional
    if (!error?.response && !error?.request) {
      console.error('🚨 Error sin response ni request - posible problema de red:', {
        error: error,
        errorType: typeof error,
        errorKeys: error ? Object.keys(error) : 'No error object',
        window: typeof window !== 'undefined',
        navigator: typeof navigator !== 'undefined'
      });
    }
    
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