"use client"

import { useEffect, useState } from 'react'

export default function ThemeDebugger() {
  const [theme, setTheme] = useState<string>('unknown')
  const [htmlClasses, setHtmlClasses] = useState<string>('')
  const [localStorageTheme, setLocalStorageTheme] = useState<string>('unknown')

  useEffect(() => {
    const updateDebugInfo = () => {
      const html = document.documentElement
      setTheme(html.classList.contains('dark') ? 'dark' : 'light')
      setHtmlClasses(html.className)
      setLocalStorageTheme(localStorage.getItem('theme') || 'null')
    }

    // Actualizar información inicial
    updateDebugInfo()

    // Escuchar cambios de tema
    const handleThemeChange = () => {
      updateDebugInfo()
    }

    window.addEventListener('themeChanged', handleThemeChange)

    // También escuchar cambios en localStorage
    window.addEventListener('storage', handleThemeChange)

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange)
      window.removeEventListener('storage', handleThemeChange)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs font-mono shadow-lg z-50">
      <div className="text-gray-600 dark:text-gray-400">
        <div><strong>Tema:</strong> {theme}</div>
        <div><strong>HTML Classes:</strong> {htmlClasses}</div>
        <div><strong>localStorage:</strong> {localStorageTheme}</div>
      </div>
    </div>
  )
}
