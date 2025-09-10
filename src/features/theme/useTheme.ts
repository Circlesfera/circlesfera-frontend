"use client";

import { useTheme as useThemeContext } from './ThemeContext';

export const useTheme = useThemeContext;

// Hook adicional para obtener solo el tema resuelto
export const useResolvedTheme = () => {
  const { resolvedTheme } = useThemeContext();
  return resolvedTheme;
};

// Hook para verificar si el tema es oscuro
export const useIsDark = () => {
  const { resolvedTheme } = useThemeContext();
  return resolvedTheme === 'dark';
};

// Hook para verificar si el tema es claro
export const useIsLight = () => {
  const { resolvedTheme } = useThemeContext();
  return resolvedTheme === 'light';
};
