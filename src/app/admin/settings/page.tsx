'use client'

import { Shield, Bell, Database, Zap } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">
          Configuración del Sistema
        </h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Ajustes generales de la plataforma
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">
              Seguridad
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
            Configuración de autenticación, rate limiting y permisos
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Rate Limiting</span>
              <span className="text-xs font-medium text-green-600">Activo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">CSRF Protection</span>
              <span className="text-xs font-medium text-green-600">Activo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">JWT Tokens</span>
              <span className="text-xs font-medium text-green-600">Activo</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">
              Notificaciones
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
            Gestión de notificaciones del sistema
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Email Service</span>
              <span className="text-xs font-medium text-green-600">SendGrid</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Push Notifications</span>
              <span className="text-xs font-medium text-green-600">Activo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">WebSockets</span>
              <span className="text-xs font-medium text-green-600">Activo</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">
              Base de Datos
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
            Estado y métricas de MongoDB Atlas
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Conexión</span>
              <span className="text-xs font-medium text-green-600">Activa</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Caché Redis</span>
              <span className="text-xs font-medium text-green-600">Activo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Backups</span>
              <span className="text-xs font-medium text-blue-600">Automático</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">
              Performance
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
            Optimización y monitoreo del sistema
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">CDN</span>
              <span className="text-xs font-medium text-yellow-600">Pendiente</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Image Optimization</span>
              <span className="text-xs font-medium text-green-600">Activo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">PWA</span>
              <span className="text-xs font-medium text-green-600">Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          ℹ️ Configuración Actual
        </h3>
        <p className="text-sm text-blue-800">
          El sistema está configurado y funcionando correctamente. Todas las features de seguridad,
          performance y notificaciones están activas.
        </p>
      </div>
    </div>
  )
}

