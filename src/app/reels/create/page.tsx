"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/design-system';
import { useAuth } from '@/features/auth/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import CreateReelForm from '@/components/CreateReelForm';
import { ArrowLeft } from 'lucide-react';

export default function CreateReelPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  const handleReelCreated = () => {
    // Redirigir al feed de reels después de crear
    router.push('/reels');
  };

  const handleClose = () => {
    // Volver a la página anterior
    router.back();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="mr-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Volver
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">
                  Crear Reel
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <CreateReelForm
            onReelCreated={handleReelCreated}
            onClose={handleClose}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
