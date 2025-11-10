'use client';

import { useQuery } from '@tanstack/react-query';
import { type ReactElement, type ReactNode, useEffect, useMemo } from 'react';

import { getPreferences } from '@/services/api/preferences';
import { useSessionStore } from '@/store/session';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  readonly children: ReactNode;
}

/**
 * Determina el tema efectivo basado en la preferencia y el sistema
 */
function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Default para SSR
  }
  return theme;
}

/**
 * Aplica el tema al elemento HTML y lo guarda en localStorage
 */
function applyTheme(effectiveTheme: 'light' | 'dark', theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  
  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
  
  // Guardar en localStorage para el script inline
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Ignorar errores de localStorage (puede estar deshabilitado)
  }
}

/**
 * Provider que maneja el tema de la aplicación basado en las preferencias del usuario.
 * Aplica la clase 'dark' al elemento HTML según el tema seleccionado.
 */
export function ThemeProvider({ children }: ThemeProviderProps): ReactElement {
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  // Obtener preferencias del usuario
  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: getPreferences,
    enabled: isHydrated && !!accessToken,
    staleTime: 0, // Invalidar inmediatamente cuando cambia
    gcTime: Infinity, // Mantener en cache indefinidamente
    retry: false
  });

  // Obtener tema: primero desde preferencias del servidor, luego desde localStorage, luego default
  const theme: Theme = (() => {
    if (preferences?.preferences?.theme) {
      return preferences.preferences.theme;
    }
    
    // Si no hay preferencias del servidor, intentar leer de localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
          return storedTheme as Theme;
        }
      } catch {
        // Ignorar errores de localStorage
      }
    }
    
    return 'dark'; // Default
  })();
  
  // Calcular el tema efectivo
  const effectiveTheme = useMemo(() => getEffectiveTheme(theme), [theme]);

  // Aplicar tema cuando cambia
  useEffect(() => {
    applyTheme(effectiveTheme, theme);
  }, [effectiveTheme, theme]);

  // Escuchar cambios en la preferencia del sistema si el tema es 'system'
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent): void => {
      const newTheme = e.matches ? 'dark' : 'light';
      applyTheme(newTheme, theme);
    };

    // Escuchar cambios
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Aplicar tema inicial si no hay sesión (usar sistema)
  useEffect(() => {
    if (!isHydrated || !accessToken) {
      const systemTheme = typeof window !== 'undefined' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : 'dark';
      applyTheme(systemTheme, 'system');
    }
  }, [isHydrated, accessToken]);

  return <>{children}</>;
}

