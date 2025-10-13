"use client"

import { useState } from 'react'

export default function ThemeCleaner() {
  const [isCleaning, setIsCleaning] = useState(false)

  const cleanThemeState = () => {
    setIsCleaning(true)

    console.log('🧹 Cleaning theme state...')

    // Limpiar completamente el estado del tema
    document.documentElement.classList.remove('dark', 'light')
    localStorage.removeItem('theme')

    // Resetear color scheme
    document.documentElement.style.colorScheme = ''

    // Detectar preferencia del sistema
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    console.log('🔍 System prefers dark:', systemPrefersDark)

    // Aplicar tema basado en preferencia del sistema
    if (systemPrefersDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      console.log('🌙 Applied dark theme')
    } else {
      localStorage.setItem('theme', 'light')
      console.log('☀️ Applied light theme')
    }

    // Disparar evento de cambio
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: systemPrefersDark ? 'dark' : 'light' }
    }))

    console.log('✅ Theme state cleaned and reset')

    setTimeout(() => {
      setIsCleaning(false)
    }, 1000)
  }

  return (
    <div className="fixed bottom-32 right-4 z-50">
      <div className="bg-white dark:bg-gray-900 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-2">
          Theme Cleaner
        </div>
        <button
          onClick={cleanThemeState}
          disabled={isCleaning}
          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
        >
          🧹 {isCleaning ? 'Cleaning...' : 'Clean & Reset'}
        </button>
      </div>
    </div>
  )
}
