"use client";

import { useTheme as useThemeContext } from './ThemeContext';

export const useTheme = useThemeContext;

// Hook adicional para obtener solo el tema resuelto (siempre 'light')
export const useResolvedTheme = () => {
  const { resolvedTheme } = useThemeContext();
  return resolvedTheme;
};

// Hook para verificar si el tema es oscuro (siempre false)
export const useIsDark = () => {
  return false;
};

// Hook para verificar si el tema es claro (siempre true)
export const useIsLight = () => {
  return true;
};
