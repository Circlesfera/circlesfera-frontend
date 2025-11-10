'use client';

import { useMemo } from 'react';

import type { SessionState } from '@/store/session';
import { useSessionStore } from '@/store/session';

/**
 * Hook para acceder a la sesión autenticada y sus acciones.
 */
type UseSessionResult = Pick<
  SessionState,
  'user' | 'accessToken' | 'expiresAt' | 'isHydrated' | 'setSession' | 'clearSession' | 'updateUser' | 'markHydrated'
>;

export const useSession = (): UseSessionResult => {
  const user = useSessionStore((state) => state.user);
  const accessToken = useSessionStore((state) => state.accessToken);
  const expiresAt = useSessionStore((state) => state.expiresAt);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const setSession = useSessionStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);
  const updateUser = useSessionStore((state) => state.updateUser);
  const markHydrated = useSessionStore((state) => state.markHydrated);

  return useMemo<UseSessionResult>(
    () => ({
      user,
      accessToken,
      expiresAt,
      isHydrated,
      setSession,
      clearSession,
      updateUser,
      markHydrated
    }),
    [user, accessToken, expiresAt, isHydrated, setSession, clearSession, updateUser, markHydrated]
  );
};

