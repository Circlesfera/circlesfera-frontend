'use client'

import { Users, Shield, Ban, CheckCircle } from 'lucide-react'

export default function UsersPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestión de Usuarios
        </h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Administra usuarios, roles y permisos
        </p>
      </div>

      {/* Placeholder */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Gestión de Usuarios
          </h2>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-6 max-w-md mx-auto">
            Esta sección te permitirá ver, buscar y gestionar usuarios de la plataforma.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-900">Cambiar Roles</p>
              <p className="text-xs text-blue-700 mt-1">Admin, Moderador, Usuario</p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <Ban className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-red-900">Suspender/Banear</p>
              <p className="text-xs text-red-700 mt-1">Gestión de sanciones</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900">Verificar Usuarios</p>
              <p className="text-xs text-green-700 mt-1">Badge de verificación</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-8">
            🚧 Próximamente disponible
          </p>
        </div>
      </div>
    </div>
  )
}

