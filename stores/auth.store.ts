'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPublic } from '@/lib/shared';

interface AuthState {
  token: string | null;
  user: UserPublic | null;
  setAuth: (token: string, user: UserPublic) => void;
  updateUser: (user: Partial<UserPublic>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      updateUser: (update) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...update } : null,
        })),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'cg-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
