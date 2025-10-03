import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind CSS de manera inteligente
 * Resuelve conflictos entre clases y permite sobrescribir estilos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}