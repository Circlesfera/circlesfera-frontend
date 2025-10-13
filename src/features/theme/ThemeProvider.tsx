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

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'circlesfera-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  // Obtener tema inicial
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null
    if (stored) {
      setThemeState(stored)
    }
  }, [storageKey])

  // Resolver tema basado en preferencias
  useEffect(() => {
    const root = window.document.documentElement

    // Remover clases anteriores
    root.classList.remove('light', 'dark')

    let resolved: ResolvedTheme

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      resolved = systemTheme
    } else {
      resolved = theme
    }

    setResolvedTheme(resolved)
    root.classList.add(resolved)

    // Actualizar color-scheme del meta tag
    const metaTheme = document.querySelector('meta[name="color-scheme"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', resolved)
    }
  }, [theme])

  // Escuchar cambios en preferencias del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (theme === 'system') {
        const resolved = mediaQuery.matches ? 'dark' : 'light'
        setResolvedTheme(resolved)

        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(resolved)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Setear tema
  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }

  // Toggle entre light y dark
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
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

