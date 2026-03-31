import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface UserStore {
  user: User | null;
  isAuthReady: boolean;
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  updateCredits: (amount: number) => void;
  updateFragments: (amount: number) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthReady: false,
      setUser: (user) => set({ user }),
      setAuthReady: (ready) => set({ isAuthReady: ready }),
      updateCredits: (amount) =>
        set((state) => ({
          user: state.user ? { ...state.user, credits: state.user.credits + amount } : null,
        })),
      updateFragments: (amount) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, destiny_fragments: state.user.destiny_fragments + amount }
            : null,
        })),
    }),
    {
      name: 'destiny-baby-user',
      // isAuthReady는 매 페이지 로드마다 false로 시작해야 하므로 persist 제외
      partialize: (state) => ({ user: state.user }),
    }
  )
);
