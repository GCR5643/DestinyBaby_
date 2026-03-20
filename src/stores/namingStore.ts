import { create } from 'zustand';
import type { SajuResult, SuggestedName, NamingReport, Gender } from '@/types';

interface NamingStore {
  parent1Saju: SajuResult | null;
  parent2Saju: SajuResult | null;
  gender: Gender;
  babyBirthDate: string;
  babyBirthTime: string;
  hangryeolChar: string;
  siblingNames: string[];
  suggestedNames: SuggestedName[];
  selectedName: SuggestedName | null;
  currentReport: NamingReport | null;
  setParent1Saju: (saju: SajuResult) => void;
  setParent2Saju: (saju: SajuResult) => void;
  setGender: (gender: Gender) => void;
  setBabyBirthDate: (date: string) => void;
  setBabyBirthTime: (time: string) => void;
  setSuggestedNames: (names: SuggestedName[]) => void;
  setSelectedName: (name: SuggestedName) => void;
  setCurrentReport: (report: NamingReport) => void;
  reset: () => void;
}

export const useNamingStore = create<NamingStore>((set) => ({
  parent1Saju: null,
  parent2Saju: null,
  gender: 'unknown',
  babyBirthDate: '',
  babyBirthTime: '',
  hangryeolChar: '',
  siblingNames: [],
  suggestedNames: [],
  selectedName: null,
  currentReport: null,
  setParent1Saju: (saju) => set({ parent1Saju: saju }),
  setParent2Saju: (saju) => set({ parent2Saju: saju }),
  setGender: (gender) => set({ gender }),
  setBabyBirthDate: (date) => set({ babyBirthDate: date }),
  setBabyBirthTime: (time) => set({ babyBirthTime: time }),
  setSuggestedNames: (names) => set({ suggestedNames: names }),
  setSelectedName: (name) => set({ selectedName: name }),
  setCurrentReport: (report) => set({ currentReport: report }),
  reset: () => set({
    parent1Saju: null, parent2Saju: null, gender: 'unknown',
    babyBirthDate: '', babyBirthTime: '', hangryeolChar: '',
    siblingNames: [], suggestedNames: [], selectedName: null, currentReport: null,
  }),
}));
