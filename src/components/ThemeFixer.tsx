"use client"

import { useState } from 'react'

export default function ThemeFixer() {
  const [isFixing, setIsFixing] = useState(false)

  const forceDarkMode = () => {
    setIsFixing(true)

    console.log('🔧 Force fixing theme to dark mode...')

    // Forzar tema oscuro
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
    localStorage.setItem('theme', 'dark')

    // Forzar color scheme
    document.documentElement.style.colorScheme = 'dark'

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: 'dark' }
    }))

    console.log('✅ Theme forced to dark mode')

    setTimeout(() => {
      setIsFixing(false)
    }, 1000)
  }

  const forceLightMode = () => {
    setIsFixing(true)

    console.log('🔧 Force fixing theme to light mode...')

    // Forzar tema claro
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    localStorage.setItem('theme', 'light')

    // Forzar color scheme
    document.documentElement.style.colorScheme = 'light'

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: 'light' }
    }))

    console.log('✅ Theme forced to light mode')

    setTimeout(() => {
      setIsFixing(false)
    }, 1000)
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-2">
          Theme Fixer
        </div>
        <div className="flex gap-2">
          <button
            onClick={forceDarkMode}
            disabled={isFixing}
            className="px-2 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 disabled:opacity-50"
          >
            🌙 Dark
          </button>
          <button
            onClick={forceLightMode}
            disabled={isFixing}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            ☀️ Light
          </button>
        </div>
      </div>
    </div>
  )
}
