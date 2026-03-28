'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ParentInfo {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
}

interface ParentStore {
  dad: ParentInfo | null;
  mom: ParentInfo | null;
  setDad: (info: ParentInfo | null) => void;
  setMom: (info: ParentInfo | null) => void;
  /** 부모 정보가 최소 1명이라도 입력되어 있는지 */
  hasAnyParent: () => boolean;
  /** 부모 정보가 모두 입력되어 있는지 */
  hasBothParents: () => boolean;
}

export const useParentStore = create<ParentStore>()(
  persist(
    (set, get) => ({
      dad: null,
      mom: null,
      setDad: (info) => set({ dad: info }),
      setMom: (info) => set({ mom: info }),
      hasAnyParent: () => !!(get().dad || get().mom),
      hasBothParents: () => !!(get().dad?.birthDate && get().mom?.birthDate),
    }),
    { name: 'destiny-baby-parents' }
  )
);
