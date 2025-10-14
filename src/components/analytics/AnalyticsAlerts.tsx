'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Info,
  AlertCircle,
  X,
  Activity,
  Users,
  Flag,
  Zap
} from 'lucide-react'

interface AnalyticsAlert {
  type: string
  message: string
  severity: 'info' | 'warning' | 'error'
  data?: any
}

interface AnalyticsAlertsProps {
  alerts: AnalyticsAlert[]
  onClear: () => void
  maxAlerts?: number
}

export function AnalyticsAlerts({ alerts, onClear, maxAlerts = 5 }: AnalyticsAlertsProps) {
  const [visibleAlerts, setVisibleAlerts] = useState<AnalyticsAlert[]>([])

  useEffect(() => {
    // Mostrar solo las alertas más recientes
    const recentAlerts = alerts.slice(-maxAlerts)
    setVisibleAlerts(recentAlerts)

    // Auto-ocultar alertas después de 10 segundos
    const timer = setTimeout(() => {
      if (alerts.length > 0) {
        setVisibleAlerts(prev => prev.slice(1))
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [alerts, maxAlerts])

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200'
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200'
    }
  }

  const getAlertIconColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'info':
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'high_activity':
        return <Activity className="w-4 h-4" />
      case 'high_reports':
        return <Flag className="w-4 h-4" />
      case 'system_errors':
        return <Zap className="w-4 h-4" />
      case 'new_user':
        return <Users className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  if (visibleAlerts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence>
        {visibleAlerts.map((alert, index) => (
          <motion.div
            key={`${alert.type}-${index}`}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`max-w-sm w-full rounded-lg border p-4 shadow-lg ${getAlertColor(alert.severity)}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${getAlertIconColor(alert.severity)}`}>
                {getAlertIcon(alert.severity)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`${getAlertIconColor(alert.severity)}`}>
                    {getEventIcon(alert.type)}
                  </div>
                  <h4 className="text-sm font-semibold truncate">
                    {alert.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                </div>

                <p className="text-sm opacity-90 leading-relaxed">
                  {alert.message}
                </p>

                {alert.data && (
                  <div className="mt-2 text-xs opacity-75">
                    {Object.entries(alert.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setVisibleAlerts(prev => prev.filter((_, i) => i !== index))
                }}
                className={`flex-shrink-0 ${getAlertIconColor(alert.severity)} hover:opacity-75 transition-opacity`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Botón para limpiar todas las alertas */}
      {visibleAlerts.length > 1 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onClear}
          className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg py-2 px-3 text-sm font-medium transition-colors duration-200"
        >
          Limpiar todas las alertas
        </motion.button>
      )}
    </div>
  )
}

export default AnalyticsAlerts
