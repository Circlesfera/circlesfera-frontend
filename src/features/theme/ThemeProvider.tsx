"use client"

/**
 * 🌓 THEME PROVIDER
 * =================
 * Context provider para tema claro/oscuro
 *
 * ✅ Persistencia en localStorage
 * ✅ Respeta preferencias del sistema
 * ✅ Transiciones suaves
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isHydrated: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [isHydrated, setIsHydrated] = useState(false)

  // Inicializar tema después de la hidratación
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme | null
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeState(savedTheme)
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setThemeState(systemPrefersDark ? 'dark' : 'light')
    }
    setIsHydrated(true)
  }, [storageKey])

  // Aplicar tema inmediatamente cuando cambie
  useEffect(() => {
    const root = document.documentElement

    // Aplicar clases
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }

    // Aplicar colorScheme
    root.style.colorScheme = theme

    // Actualizar meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#111827' : '#ffffff')
    }

    // Guardar en localStorage
    localStorage.setItem(storageKey, theme)

    // Forzar un repaint del DOM
    void root.offsetHeight

    console.log('🎨 TEMA APLICADO:', {
      tema: theme,
      htmlClasses: root.className,
      hasDark: root.classList.contains('dark'),
      hasLight: root.classList.contains('light'),
      colorScheme: root.style.colorScheme,
      localStorage: localStorage.getItem(storageKey)
    })
  }, [theme, storageKey])

  const handleSetTheme = (newTheme: Theme) => {
    console.log('🔄 Cambiando tema a:', newTheme)
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    console.log('🔄 Toggle tema:', theme, '→', newTheme)
    setThemeState(newTheme)
  }

  const value: ThemeContextType = {
    theme,
    resolvedTheme: theme,
    setTheme: handleSetTheme,
    toggleTheme,
    isHydrated,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook para usar el tema
 */
export function useTheme() {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

