import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Helper para lazy loading de componentes
 */
export const lazyLoad = function<T extends ComponentType<Record<string, unknown>>>(
  importFunc: () => Promise<{ default: T }>,
  options: { ssr?: boolean } = {}
) {
  const { ssr = true } = options;

  return dynamic(importFunc, {
    ssr,
  });
};

/**
 * Lazy load para componentes pesados (deshabilitado en SSR)
 */
export const lazyLoadHeavy = function<T extends ComponentType<Record<string, unknown>>>(
  importFunc: () => Promise<{ default: T }>
) {
  return dynamic(importFunc, {
    ssr: false,
  });
};

/**
 * Lazy load para modales y overlays
 */
export const lazyLoadModal = function<T extends ComponentType<Record<string, unknown>>>(
  importFunc: () => Promise<{ default: T }>
) {
  return dynamic(importFunc, {
    ssr: false,
  });
};