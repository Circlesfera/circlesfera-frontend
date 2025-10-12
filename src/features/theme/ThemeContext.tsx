"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Aplicar tema claro al documento
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Remover clase dark si existe
    root.classList.remove('dark');

    // Asegurar que siempre tenga la clase light
    root.classList.add('light');

    // Actualizar meta theme-color para móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#ffffff');
    }

    // Limpiar localStorage si tiene tema guardado
    localStorage.removeItem('theme');
  }, [mounted]);

  // Inicializar montaje
  useEffect(() => {
    setMounted(true);
  }, []);

  // Funciones vacías para mantener compatibilidad con código existente
  const handleSetTheme = () => {
    // No hace nada, siempre es light
  };

  const toggleTheme = () => {
    // No hace nada, siempre es light
  };

  return (
    <ThemeContext.Provider value={{
      theme: 'light',
      resolvedTheme: 'light',
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
