'use client'

import { useRouter } from 'next/navigation'
import CreatePostForm from '@/components/CreatePostForm'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ArrowLeft } from 'lucide-react'

export default function CreatePostPage() {
  const router = useRouter()

  const handlePostCreated = () => {
    // Redirigir al feed después de crear el post
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
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Crear publicación
            </h1>
            <p className="text-sm text-gray-600">
              Comparte una imagen o video con tu comunidad
            </p>
          </div>
        </div>

        {/* Formulario de creación */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <CreatePostForm onPostCreated={handlePostCreated} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
