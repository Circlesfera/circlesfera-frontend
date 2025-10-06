import { useState, useEffect } from 'react';

/**
 * Hook para detectar estado online/offline del navegador
 * @returns Estado de conexión y función para refrescar
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('✅ Conexión restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('⚠️ Sin conexión');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

