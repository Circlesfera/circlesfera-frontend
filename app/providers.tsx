'use client';

import type { ReactElement, ReactNode } from 'react';
import { useEffect, useState } from 'react';

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
  const user = useSessionStore((state) => state.user);
  const accessToken = useSessionStore((state) => state.accessToken);
  const expiresAt = useSessionStore((state) => state.expiresAt);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const setSession = useSessionStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);
  const markHydrated = useSessionStore((state) => state.markHydrated);

  useEffect(() => {
    if (isHydrated) {
      return;
    }

    const hydrate = async (): Promise<void> => {
      try {
        if (accessToken && expiresAt && expiresAt > Date.now()) {
          markHydrated(user ?? null);
          return;
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
        console.warn('No se pudo refrescar la sesión automáticamente', error);
        clearSession();
        markHydrated(null);
      }
    };

    void hydrate();
  }, [accessToken, clearSession, expiresAt, isHydrated, markHydrated, setSession, user]);

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

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      <SessionHydrator />
      <Toaster position="top-right" richColors closeButton />
      {process.env.NODE_ENV !== 'production' ? <ReactQueryDevtools buttonPosition="bottom-right" /> : null}
    </QueryClientProvider>
  );
};

