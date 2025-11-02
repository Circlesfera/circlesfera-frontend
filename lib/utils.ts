/**
 * Formatea un número con separadores de miles usando la localización en español.
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('es');
};

