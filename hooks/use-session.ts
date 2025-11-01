'use client';

import { useSessionStore } from '@/store/session';

/**
 * Hook para acceder a la sesión autenticada y sus acciones.
 */
export const useSession = () =>
  useSessionStore((state) => ({
    user: state.user,
    accessToken: state.accessToken,
    expiresAt: state.expiresAt,
    isHydrated: state.isHydrated,
    setSession: state.setSession,
    clearSession: state.clearSession,
    updateUser: state.updateUser,
    markHydrated: state.markHydrated
  }));

