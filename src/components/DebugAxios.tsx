"use client";

import { useEffect, useState } from 'react';
import api from '@/services/axios';

export default function DebugAxios() {
  const [axiosInfo, setAxiosInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    // Obtener información de la configuración de Axios
    const config = {
      baseURL: api.defaults.baseURL,
      timeout: api.defaults.timeout,
      headers: api.defaults.headers,
      withCredentials: api.defaults.withCredentials
    };
    
    setAxiosInfo(config);
  }, []);

  const testAxiosRequest = async () => {
    try {
      console.log('🧪 Probando petición Axios directa...');
      
      // Test 1: Petición directa con Axios
      const response = await api.get('/users/profile/demo');
      
      setTestResult({
        success: true,
        status: response.status,
        data: response.data,
        config: {
          baseURL: response.config.baseURL,
          url: response.config.url,
          method: response.config.method,
          headers: response.config.headers
        }
      });
      
      console.log('✅ Petición Axios exitosa:', response);
    } catch (error: any) {
      console.error('❌ Error en petición Axios:', error);
      
      setTestResult({
        success: false,
        error: {
          message: error?.message || 'Error desconocido',
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          url: error?.config?.url,
          method: error?.config?.method,
          baseURL: error?.config?.baseURL,
          fullUrl: error?.config?.baseURL + error?.config?.url,
          headers: error?.config?.headers,
          code: error?.code,
          name: error?.name
        }
      });
    }
  };

  useEffect(() => {
    testAxiosRequest();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">🔧 Debug Axios</h3>
      
      {axiosInfo && (
        <div className="text-xs space-y-2 mb-3">
          <div><strong>BaseURL:</strong> {axiosInfo.baseURL}</div>
          <div><strong>Timeout:</strong> {axiosInfo.timeout}ms</div>
          <div><strong>WithCredentials:</strong> {axiosInfo.withCredentials ? 'Sí' : 'No'}</div>
        </div>
      )}
      
      <button 
        onClick={testAxiosRequest}
        className="btn-primary mb-3 w-full"
      >
        Re-test Axios
      </button>
      
      {testResult && (
        <div className="text-xs space-y-2">
          <div><strong>Éxito:</strong> {testResult.success ? 'Sí' : 'No'}</div>
          {testResult.success ? (
            <>
              <div><strong>Status:</strong> {testResult.status}</div>
              <div><strong>URL:</strong> {testResult.config?.url}</div>
              <div><strong>BaseURL:</strong> {testResult.config?.baseURL}</div>
            </>
          ) : (
            <>
              <div><strong>Error:</strong> {testResult.error?.message}</div>
              <div><strong>Status:</strong> {testResult.error?.status || 'N/A'}</div>
              <div><strong>URL:</strong> {testResult.error?.url || 'N/A'}</div>
              <div><strong>BaseURL:</strong> {testResult.error?.baseURL || 'N/A'}</div>
              <div><strong>FullURL:</strong> {testResult.error?.fullUrl || 'N/A'}</div>
              <div><strong>Code:</strong> {testResult.error?.code || 'N/A'}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 