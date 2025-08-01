"use client";

import { useEffect, useState } from 'react';

export default function DebugNetwork() {
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [axiosInfo, setAxiosInfo] = useState<any>(null);

  useEffect(() => {
    const testRequest = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/users/profile/demo');
        const data = await response.json();
        setNetworkInfo({
          status: response.status,
          ok: response.ok,
          data: data,
          error: null
        });
      } catch (error) {
        setNetworkInfo({
          status: null,
          ok: false,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    const testAxiosRequest = async () => {
      try {
        // Simular la petición que está fallando
        const response = await fetch('http://localhost:5001/api/users/profile/demo', {
          headers: {
            'Content-Type': 'application/json',
            // Simular el header de autorización que podría estar causando problemas
            'Authorization': 'Bearer test-token'
          }
        });
        const data = await response.json();
        setAxiosInfo({
          status: response.status,
          ok: response.ok,
          data: data,
          error: null,
          url: 'http://localhost:5001/api/users/profile/demo'
        });
      } catch (error) {
        setAxiosInfo({
          status: null,
          ok: false,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
          url: 'http://localhost:5001/api/users/profile/demo'
        });
      }
    };

    testRequest();
    testAxiosRequest();
  }, []);

  if (!networkInfo) {
    return <div className="fixed top-20 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">Cargando debug...</div>;
  }

  return (
    <div className="fixed top-20 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Network</h3>
      <div className="text-xs space-y-2">
        <div><strong>Fetch Status:</strong> {networkInfo.status}</div>
        <div><strong>Fetch OK:</strong> {networkInfo.ok ? 'Sí' : 'No'}</div>
        <div><strong>Fetch Error:</strong> {networkInfo.error || 'Ninguno'}</div>
        <div><strong>Window:</strong> {typeof window !== 'undefined' ? 'Sí' : 'No'}</div>
        <hr className="my-2" />
        <div><strong>Axios Status:</strong> {axiosInfo?.status || 'N/A'}</div>
        <div><strong>Axios OK:</strong> {axiosInfo?.ok ? 'Sí' : 'No'}</div>
        <div><strong>Axios Error:</strong> {axiosInfo?.error || 'N/A'}</div>
        <div><strong>URL:</strong> {axiosInfo?.url || 'N/A'}</div>
      </div>
    </div>
  );
} 