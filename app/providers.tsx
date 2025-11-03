'use client';

import type { ReactElement, ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { initSentry } from '@/lib/sentry.config';

import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  type DehydratedState
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

import { createQueryClient } from '@/lib/query-client';
import { refreshSession, fetchCurrentUser } from '@/services/api/auth';
import { useSessionStore } from '@/store/session';

const SessionHydrator = (): null => {
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);
  const expiresAt = useSessionStore((state) => state.expiresAt);

  useEffect(() => {
    if (isHydrated) {
      return;
    }

    const hydrate = async (): Promise<void> => {
      // Obtener las funciones del store dentro del efecto para evitar dependencias
      const { setSession, clearSession, markHydrated } = useSessionStore.getState();

      try {
        if (accessToken && expiresAt && expiresAt > Date.now()) {
          // Si tenemos token válido, intentamos verificar que el usuario aún existe
          try {
            const profile = await fetchCurrentUser(accessToken);
            if (profile.user) {
              markHydrated(profile.user);
              return;
            }
          } catch (err) {
            // Si falla, intentamos refrescar
          }
        }

        const tokens = await refreshSession();
        const profile = await fetchCurrentUser(tokens.accessToken);

        setSession({
          user: profile.user,
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn
        });
        markHydrated(profile.user);
      } catch (error) {
        // Silenciosamente limpiamos la sesión si no se puede refrescar
        // Esto es normal cuando la sesión expiró o el usuario no existe
        clearSession();
        markHydrated(null);
      }
    };

    void hydrate();
    // Solo dependemos de los valores que realmente importan para la hidratación
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, accessToken, expiresAt]);

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
export const Providers = ({ children, dehydratedState }: ProvidersProps): ReactElement => {
  const [queryClient] = useState<QueryClient>(() => createQueryClient());

  // Inicializar Sentry una vez
  useEffect(() => {
    initSentry();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      <SessionHydrator />
      <Toaster position="top-right" richColors closeButton />
      {process.env.NODE_ENV !== 'production' ? <ReactQueryDevtools buttonPosition="bottom-right" /> : null}
    </QueryClientProvider>
  );
};

