'use client';

import { useMemo } from 'react';
import { useSessionStore } from '@/store/session';

/**
 * Hook para acceder a la sesión autenticada y sus acciones.
 * Usa selectores individuales y memoización para evitar loops infinitos.
 * Las funciones del store son estables (no cambian) por lo que no necesitan estar en las dependencias.
 */
export const useSession = () => {
  const user = useSessionStore((state) => state.user);
  const accessToken = useSessionStore((state) => state.accessToken);
  const expiresAt = useSessionStore((state) => state.expiresAt);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  
  // Obtener funciones del store - son estables y no cambian entre renders
  const { setSession, clearSession, updateUser, markHydrated } = useSessionStore.getState();

  // Memoizar solo los valores que pueden cambiar (no las funciones)
  return useMemo(
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
    // Solo incluir valores primitivos que pueden cambiar, no funciones (que son estables)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, accessToken, expiresAt, isHydrated]
  );
};

