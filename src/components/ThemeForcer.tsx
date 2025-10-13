"use client"

import { useState } from 'react'

export default function ThemeForcer() {
  const [isForcing, setIsForcing] = useState(false)

  const forceLightTheme = () => {
    setIsForcing(true)
    console.log('☀️ FORCING LIGHT THEME COMPLETELY...')

    // 1. Remover clase dark del HTML
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')

    // 2. Forzar estilos inline en elementos críticos
    const criticalSelectors = [
      'body',
      '.bg-white',
      '.bg-gray-50',
      '.bg-gray-100',
      '[class*="bg-gray-900"]',
      '[class*="bg-gray-800"]',
      '[class*="bg-gray-700"]'
    ]

    criticalSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          // Forzar estilos claros
          if (el.className.includes('bg-gray-900') || el.className.includes('bg-gray-800') || el.className.includes('bg-gray-700')) {
            el.style.backgroundColor = '#ffffff !important'
            el.style.color = '#111827 !important'
          } else if (el.className.includes('bg-white')) {
            el.style.backgroundColor = '#ffffff !important'
            el.style.color = '#111827 !important'
          } else if (el.tagName === 'BODY') {
            el.style.backgroundColor = '#ffffff !important'
            el.style.color = '#111827 !important'
          }
        }
      })
    })

    // 3. Buscar y forzar todos los elementos con clases dark:
    const allElements = document.querySelectorAll('*')
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        const className = el.className
        if (className.includes('dark:')) {
          // Remover clases dark: y aplicar estilos claros
          el.style.backgroundColor = el.style.backgroundColor || '#ffffff'
          el.style.color = el.style.color || '#111827'
          el.style.borderColor = el.style.borderColor || '#e5e7eb'
        }
      }
    })

    // 4. Actualizar localStorage
    localStorage.setItem('theme', 'light')

    // 5. Forzar color-scheme
    document.documentElement.style.colorScheme = 'light'

    console.log('✅ LIGHT THEME FORCED')

    setTimeout(() => {
      setIsForcing(false)
    }, 2000)
  }

  const forceDarkTheme = () => {
    setIsForcing(true)
    console.log('🌙 FORCING DARK THEME COMPLETELY...')

    // 1. Agregar clase dark al HTML
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')

    // 2. Forzar estilos inline en elementos críticos
    const criticalSelectors = [
      'body',
      '.bg-white',
      '.bg-gray-50',
      '.bg-gray-100'
    ]

    criticalSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          // Forzar estilos oscuros
          if (el.className.includes('bg-white') || el.className.includes('bg-gray-50') || el.className.includes('bg-gray-100')) {
            el.style.backgroundColor = '#111827 !important'
            el.style.color = '#f9fafb !important'
          } else if (el.tagName === 'BODY') {
            el.style.backgroundColor = '#111827 !important'
            el.style.color = '#f9fafb !important'
          }
        }
      })
    })

    // 3. Actualizar localStorage
    localStorage.setItem('theme', 'dark')

    // 4. Forzar color-scheme
    document.documentElement.style.colorScheme = 'dark'

    console.log('✅ DARK THEME FORCED')

    setTimeout(() => {
      setIsForcing(false)
    }, 2000)
  }

  const resetAllStyles = () => {
    setIsForcing(true)
    console.log('🧹 RESETTING ALL STYLES...')

    // Remover todos los estilos inline
    const allElements = document.querySelectorAll('*')
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.backgroundColor = ''
        el.style.color = ''
        el.style.borderColor = ''
      }
    })

    // Resetear color-scheme
    document.documentElement.style.colorScheme = ''

    // Limpiar clases
    document.documentElement.classList.remove('light', 'dark')

    console.log('✅ STYLES RESET')

    setTimeout(() => {
      setIsForcing(false)
    }, 1000)
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
          🚨 Theme Forcer
        </div>

        <div className="space-y-2">
          <button
            onClick={forceLightTheme}
            disabled={isForcing}
            className="w-full px-3 py-2 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            ☀️ FORCE LIGHT (Inline Styles)
          </button>

          <button
            onClick={forceDarkTheme}
            disabled={isForcing}
            className="w-full px-3 py-2 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50"
          >
            🌙 FORCE DARK (Inline Styles)
          </button>

          <button
            onClick={resetAllStyles}
            disabled={isForcing}
            className="w-full px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
          >
            🧹 Reset All Styles
          </button>
        </div>

        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          Status: {isForcing ? 'Forcing...' : 'Ready'}
        </div>
      </div>
    </div>
  )
}
