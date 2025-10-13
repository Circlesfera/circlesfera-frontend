"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();
  
  // Redirigir al perfil del usuario actual usando la ruta dinámica
  useEffect(() => {
    if (user?.username) {
      window.location.href = `/${user.username}`;
    }
  }, [user?.username]);

  // Mostrar loading mientras se redirige
  if (!user?.username) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Redirigiendo...</h3>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Te estamos llevando a tu perfil</p>
        </div>
      </div>
    );
  }

  return null; // No se renderiza nada, solo redirige
}
