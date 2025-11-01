'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface SessionUser {
  readonly id: string;
  readonly email: string;
  readonly handle: string;
  readonly displayName: string;
  readonly bio: string | null;
  readonly avatarUrl: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface SessionState {
  readonly user: SessionUser | null;
  readonly accessToken: string | null;
  readonly expiresAt: number | null;
  readonly isHydrated: boolean;
  readonly setSession: (payload: {
    user: SessionUser;
    accessToken: string;
    expiresIn: number;
  }) => void;
  readonly clearSession: () => void;
  readonly updateUser: (user: SessionUser) => void;
  readonly markHydrated: (user: SessionUser | null) => void;
}

export const useSessionStore = create<SessionState>()(
  devtools((set) => ({
    user: null,
    accessToken: null,
    expiresAt: null,
    isHydrated: false,
    setSession: ({ user, accessToken, expiresIn }) => {
      set({
        user,
        accessToken,
        expiresAt: Date.now() + expiresIn * 1000
      });
    },
    clearSession: () => {
      set({ user: null, accessToken: null, expiresAt: null });
    },
    updateUser: (user) => {
      set((state) => ({
        user,
        accessToken: state.accessToken,
        expiresAt: state.expiresAt
      }));
    },
    markHydrated: (user) => {
      set((state) => ({
        user: user ?? state.user,
        isHydrated: true
      }));
    }
  }))
);

/**
 * Referencia estática al store para uso fuera de componentes React.
 */
export const sessionStore = {
  getState: (): SessionState => useSessionStore.getState(),
  setState: useSessionStore.setState
};

