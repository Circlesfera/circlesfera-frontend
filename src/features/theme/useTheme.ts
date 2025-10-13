"use client";

import { useTheme as useThemeContext } from './ThemeProvider';

export const useTheme = useThemeContext;

// Hook adicional para obtener solo el tema resuelto
export const useResolvedTheme = () => {
  const { resolvedTheme } = useThemeContext();
  return resolvedTheme;
};

// Hook para verificar si el tema es oscuro
export const useIsDark = () => {
  const { theme } = useThemeContext();
  return theme === 'dark';
};

// Hook para verificar si el tema es claro
export const useIsLight = () => {
  const { theme } = useThemeContext();
  return theme === 'light';
};
