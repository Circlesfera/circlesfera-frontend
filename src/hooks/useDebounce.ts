import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * Útil para búsquedas y requests que necesitan esperar a que el usuario termine de escribir
 * @param value - Valor a debounce
 * @param delay - Tiempo de espera en milisegundos (default: 500ms)
 * @returns Valor con debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Crear timer para actualizar el valor después del delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timeout si el valor cambia antes de que expire el timer
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

