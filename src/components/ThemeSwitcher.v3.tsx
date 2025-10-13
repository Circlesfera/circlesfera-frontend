"use client"

import { useEffect, useState } from 'react'

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Función para aplicar el tema al DOM
  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement

    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Forzar repaint
    root.style.colorScheme = newTheme
  }

  // Función para obtener el tema inicial
  const getInitialTheme = (): 'light' | 'dark' => {
    // Primero verificar localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme
    }

    // Si no hay tema guardado, usar preferencia del sistema
    if (typeof window !== 'undefined') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return systemPrefersDark ? 'dark' : 'light'
    }

    return 'light'
  }

  useEffect(() => {
    setMounted(true)

    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
    applyTheme(initialTheme)

    // Guardar tema inicial si no existe
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', initialTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'

    console.log('🔄 Toggle theme:', { from: theme, to: newTheme })

    // Actualizar estado
    setTheme(newTheme)

    // Aplicar tema al DOM
    applyTheme(newTheme)

    // Guardar en localStorage
    localStorage.setItem('theme', newTheme)

    // Log detallado para debugging
    console.log('🌓 Theme changed to:', newTheme)
    console.log('🏷️ HTML classes:', document.documentElement.className)
    console.log('💾 Stored in localStorage:', localStorage.getItem('theme'))
    console.log('🎨 Color scheme:', document.documentElement.style.colorScheme)

    // Forzar re-render de componentes que dependan del tema
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: newTheme }
    }))
  }

  if (!mounted) {
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="min-w-[44px] min-h-[44px] p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
      type="button"
      style={{ colorScheme: 'light' }} // Evitar que el navegador interfiera
    >
      {theme === 'light' ? (
        // Luna para modo claro (mostrar luna cuando está en claro)
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        // Sol para modo oscuro (mostrar sol cuando está en oscuro)
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  )
}
