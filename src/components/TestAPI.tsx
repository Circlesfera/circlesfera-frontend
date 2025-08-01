"use client";

import { useEffect, useState } from 'react';
import { getUserProfileByUsername } from '@/services/userService';

export default function TestAPI() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      console.log('🧪 Iniciando prueba de API...');
      const result = await getUserProfileByUsername('demo');
      console.log('✅ Resultado exitoso:', result);
      setTestResult({
        success: true,
        data: result,
        error: null
      });
    } catch (error: any) {
      console.error('❌ Error en prueba de API:', error);
      
      // Capturar información detallada del error
      const errorDetails = {
        message: error?.message || 'Error desconocido',
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        method: error?.config?.method,
        // Información adicional
        hasResponse: !!error?.response,
        hasRequest: !!error?.request,
        code: error?.code,
        name: error?.name,
        // Configuración
        baseURL: error?.config?.baseURL,
        fullUrl: error?.config?.baseURL + error?.config?.url,
        headers: error?.config?.headers,
        // Error completo
        fullError: error
      };
      
      setTestResult({
        success: false,
        data: null,
        error: errorDetails
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Probar automáticamente al cargar
    testAPI();
  }, []);

  return (
    <div className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">🧪 Test API</h3>
      <button 
        onClick={testAPI}
        disabled={loading}
        className="btn-primary mb-3 w-full"
      >
        {loading ? 'Probando...' : 'Probar API'}
      </button>
      
      {testResult && (
        <div className="text-xs space-y-2">
          <div><strong>Éxito:</strong> {testResult.success ? 'Sí' : 'No'}</div>
          {testResult.error && (
            <>
              <div><strong>Error:</strong> {testResult.error.message}</div>
              <div><strong>Status:</strong> {testResult.error.status || 'N/A'}</div>
              <div><strong>URL:</strong> {testResult.error.url || 'N/A'}</div>
              <div><strong>Método:</strong> {testResult.error.method || 'N/A'}</div>
              <div><strong>BaseURL:</strong> {testResult.error.baseURL || 'N/A'}</div>
              <div><strong>FullURL:</strong> {testResult.error.fullUrl || 'N/A'}</div>
              <div><strong>Code:</strong> {testResult.error.code || 'N/A'}</div>
              <div><strong>HasResponse:</strong> {testResult.error.hasResponse ? 'Sí' : 'No'}</div>
              <div><strong>HasRequest:</strong> {testResult.error.hasRequest ? 'Sí' : 'No'}</div>
            </>
          )}
          {testResult.data && (
            <div><strong>Datos:</strong> {testResult.data.username}</div>
          )}
        </div>
      )}
    </div>
  );
} 