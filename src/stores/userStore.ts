import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  updateCredits: (amount: number) => void;
  updateFragments: (amount: number) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
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
    { name: 'destiny-baby-user' }
  )
);
