"use client"

import React, { useState, useEffect } from 'react'

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
)

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
)

export default function ThemeSwitcherFinal() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Verificar el tema actual al montar
    const root = document.documentElement
    const currentIsDark = root.classList.contains('dark')
    setIsDark(currentIsDark)

    // Guardar en localStorage
    if (currentIsDark) {
      localStorage.setItem('theme', 'dark')
    } else {
      localStorage.setItem('theme', 'light')
    }
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    const newIsDark = !isDark

    if (newIsDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }

    setIsDark(newIsDark)
  }

  // Evitar flash de contenido sin estilo
  if (!mounted) {
    return (
      <div className="min-w-[44px] min-h-[44px] p-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 dark:bg-gray-800 animate-pulse" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="min-w-[44px] min-h-[44px] p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      aria-pressed={isDark}
      type="button"
    >
      <div className="text-gray-700 dark:text-gray-300">
        {isDark ? <SunIcon /> : <MoonIcon />}
      </div>
    </button>
  )
}

