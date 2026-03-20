import { create } from 'zustand';
import type { UserCard, Card } from '@/types';

interface CardStore {
  userCards: UserCard[];
  isAnimating: boolean;
  lastPulledCards: Card[];
  setUserCards: (cards: UserCard[]) => void;
  addUserCards: (cards: UserCard[]) => void;
  setAnimating: (animating: boolean) => void;
  setLastPulledCards: (cards: Card[]) => void;
}

export const useCardStore = create<CardStore>((set) => ({
  userCards: [],
  isAnimating: false,
  lastPulledCards: [],
  setUserCards: (cards) => set({ userCards: cards }),
  addUserCards: (cards) => set((state) => ({ userCards: [...state.userCards, ...cards] })),
  setAnimating: (animating) => set({ isAnimating: animating }),
  setLastPulledCards: (cards) => set({ lastPulledCards: cards }),
}));
