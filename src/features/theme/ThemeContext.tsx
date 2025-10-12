"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Resolver el tema basado en la preferencia del sistema
  useEffect(() => {
    const resolveTheme = (): void => {
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    resolveTheme();

    // Escuchar cambios en la preferencia del sistema
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => resolveTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    return undefined;
  }, [theme]);

  // Aplicar tema al documento
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    console.log('Applying theme to document:', resolvedTheme);
    console.log('Current classes:', root.className);

    // Remover clases anteriores
    root.classList.remove('light', 'dark');

    // Agregar nueva clase
    root.classList.add(resolvedTheme);

    console.log('New classes:', root.className);

    // Actualizar meta theme-color para móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#1f2937' : '#ffffff');
    }
  }, [resolvedTheme, mounted]);

  // Cargar tema guardado e inicializar
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    }

    // Log para debug
    console.log('Theme loaded:', savedTheme || 'light (default)');
  }, []);

  // Guardar tema
  const handleSetTheme = (newTheme: Theme) => {
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Alternar entre light y dark
  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    handleSetTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      resolvedTheme,
      setTheme: handleSetTheme,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
