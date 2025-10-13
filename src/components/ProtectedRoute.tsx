"use client";

import { useAuth } from '@/features/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  // Marcar como hidratado después del primer render
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!loading && !user && isHydrated) {
      router.replace('/');
    }
  }, [user, loading, router, isHydrated]);

  // Solo mostrar loading en el cliente durante la hidratación
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 via-white dark:via-gray-900 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Después de hidratación, mostrar loading si está cargando o no hay usuario
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 via-white dark:via-gray-900 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Verificando acceso...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
