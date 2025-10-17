'use client'

import { useRouter } from 'next/navigation'
import { CreateReelForm } from '@/features/reels/components'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ArrowLeft } from 'lucide-react'

export default function CreateReelPage() {
  const router = useRouter()

  const handleReelCreated = () => {
    // Redirigir al feed después de crear el reel
    router.push('/')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 rounded-full transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Crear Reel
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Comparte un video corto con tu comunidad
            </p>
          </div>
        </div>

        {/* Formulario de creación */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <CreateReelForm onReelCreated={handleReelCreated} onClose={() => router.push('/reels')} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
