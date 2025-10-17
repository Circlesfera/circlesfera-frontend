import React, { useRef, useState, useEffect, useCallback } from 'react';

interface UseLazyComponentOptions {
  rootMargin?: string; // Margen alrededor del root para Intersection Observer
  threshold?: number; // Porcentaje de visibilidad del target para disparar
}

interface LazyComponentState {
  Component: React.ComponentType<any> | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para cargar componentes de React de forma lazy.
 * Utiliza Intersection Observer para detectar cuando un componente entra en el viewport
 * y lo carga dinámicamente.
 *
 * @param importComponent Función que devuelve una Promise que resuelve el componente.
 * @param options Opciones de configuración para el Intersection Observer.
 * @returns Un objeto con el componente cargado, el estado de carga y una ref para adjuntar al contenedor.
 */
export function useLazyComponent<T extends React.ComponentType<any>>(
  importComponent: () => Promise<{ default: T }>,
  options: UseLazyComponentOptions = {}
): [T | null, React.RefObject<HTMLDivElement | null>, LazyComponentState] {
  const { rootMargin = '0px', threshold = 0.1 } = options;

  const [state, setState] = useState<LazyComponentState>({
    Component: null,
    loading: false,
    error: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadComponent = useCallback(async () => {
    if (hasLoaded) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { default: ImportedComponent } = await importComponent();
      setState({
        Component: ImportedComponent,
        loading: false,
        error: null,
      });
      setHasLoaded(true);
    } catch (error) {
      console.error('Error loading lazy component:', error);
      setState({
        Component: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }, [importComponent, hasLoaded]);

  useEffect(() => {
    if (!containerRef.current || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadComponent();
          observer.disconnect(); // Dejar de observar una vez cargado
        }
      },
      { rootMargin, threshold }
    );

    const currentElement = containerRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      observer.disconnect();
    };
  }, [loadComponent, rootMargin, threshold, hasLoaded]);

  return [state.Component as T | null, containerRef, state];
}

/**
 * Hook simplificado para lazy loading de componentes.
 * Versión más simple que solo maneja la carga básica.
 *
 * @param importComponent Función que devuelve una Promise que resuelve el componente.
 * @param options Opciones de configuración.
 * @returns El componente cargado y una ref para adjuntar al contenedor.
 */
export function useSimpleLazyComponent<T extends React.ComponentType<any>>(
  importComponent: () => Promise<{ default: T }>,
  options: UseLazyComponentOptions = {}
): [T | null, React.RefObject<HTMLDivElement | null>] {
  const [Component, containerRef] = useLazyComponent(importComponent, options);
  return [Component as T | null, containerRef];
}
