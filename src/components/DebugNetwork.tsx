"use client";

import { useEffect, useState } from 'react';

export default function DebugNetwork() {
  const [networkInfo, setNetworkInfo] = useState<any>(null);

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

    testRequest();
  }, []);

  if (!networkInfo) {
    return <div className="fixed top-20 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">Cargando debug...</div>;
  }

  return (
    <div className="fixed top-20 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Network</h3>
      <div className="text-xs space-y-1">
        <div><strong>Status:</strong> {networkInfo.status}</div>
        <div><strong>OK:</strong> {networkInfo.ok ? 'Sí' : 'No'}</div>
        <div><strong>Error:</strong> {networkInfo.error || 'Ninguno'}</div>
        <div><strong>Data:</strong> {networkInfo.data ? 'Recibido' : 'No'}</div>
        <div><strong>Window:</strong> {typeof window !== 'undefined' ? 'Sí' : 'No'}</div>
      </div>
    </div>
  );
} 