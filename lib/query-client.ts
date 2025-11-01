import { QueryClient } from '@tanstack/react-query';

/**
 * Crea una instancia de `QueryClient` con opciones por defecto enfocadas en UX:
 * reintentos prudentes, revalidación automática y caching sensible.
 */
export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 2,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
      },
      mutations: {
        retry: 1
      }
    }
  });

