'use client';

import type { DehydratedState, QueryClient } from '@tanstack/react-query';
import { HydrationBoundary, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { JSX, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';

import { createQueryClient } from '@/lib/query-client';
import { ThemeProvider } from '@/lib/theme-provider';
import { setupTokenRefresh } from '@/lib/token-refresh';
import { fetchCurrentUser, refreshSession } from '@/services/api/auth';
import { useSessionStore } from '@/store/session';

const SessionHydrator = (): null => {
  const user = useSessionStore((state) => state.user);
  const accessToken = useSessionStore((state) => state.accessToken);
  const expiresAt = useSessionStore((state) => state.expiresAt);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const setSession = useSessionStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);
  const markHydrated = useSessionStore((state) => state.markHydrated);
  const isHydratingRef = useRef(false);

  useEffect(() => {
    // Evitar ejecución múltiple simultánea
    if (isHydrated || isHydratingRef.current) {
      return;
    }

    const hydrate = async (): Promise<void> => {
      // Si ya hay una sesión válida, marcar como hidratado sin hacer peticiones
      if (accessToken && expiresAt && expiresAt > Date.now()) {
        markHydrated(user ?? null);
        return;
      }

      // Si no hay token o está expirado, intentar refrescar solo una vez
      isHydratingRef.current = true;

      try {
        // Intentar refrescar la sesión (usa cookies httpOnly para el refresh token)
        const tokens = await refreshSession();
        const profile = await fetchCurrentUser();

        setSession({
          user: profile.user,
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn
        });
        markHydrated(profile.user);
        
        // Configurar refresh automático
        setupTokenRefresh();
      } catch {
        // Si falla el refresh, limpiar la sesión para evitar estados inconsistentes
        clearSession();
        markHydrated(null);
      } finally {
        isHydratingRef.current = false;
      }
    };

    void hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  return null;
};

interface ProvidersProps {
  readonly children: ReactNode;
  readonly dehydratedState?: DehydratedState;
}

/**
 * Proveedor raíz del lado cliente. Enlaza React Query, notificaciones y cualquier
 * contexto global adicional (p.ej. internacionalización o feature flags).
 */
export const Providers = ({ children, dehydratedState }: ProvidersProps): JSX.Element => {
  const [queryClient] = useState<QueryClient>(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </HydrationBoundary>
      <SessionHydrator />
      <Toaster position="top-right" richColors closeButton />
      {process.env.NODE_ENV !== 'production' ? <ReactQueryDevtools buttonPosition="bottom-right" /> : null}
    </QueryClientProvider>
  );
};

