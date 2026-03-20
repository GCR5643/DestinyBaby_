export type Grade = 'B' | 'A' | 'S' | 'SS' | 'SSS';
export type Gender = 'male' | 'female' | 'unknown';
export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type VoiceType = 'mom' | 'dad' | 'grandma' | 'english';
export type EnglishNameOption = 'similar_sound' | 'similar_meaning' | 'same_initial' | 'global_popular' | 'custom';

export interface User {
  id: string;
  email?: string;
  nickname: string;
  avatar_url?: string;
  phone?: string;
  birth_date?: string;
  birth_time?: string;
  credits: number;
  total_pulls: number;
  created_at: string;
}

export interface Child {
  id: string;
  user_id: string;
  name: string;
  birth_date?: string;
  birth_time?: string;
  gender?: Gender;
  saju_data?: SajuResult;
  created_at: string;
}

export interface Card {
  id: string;
  name: string;
  grade: Grade;
  element?: Element;
  description?: string;
  ability?: string;
  image_url?: string;
}

export interface UserCard {
  id: string;
  user_id: string;
  card_id: string;
  obtained_at: string;
  is_favorite: boolean;
  card?: Card;
}

// Saju types
export interface SajuPillar {
  heavenlyStem: string;
  earthlyBranch: string;
  element: Element;
  yin_yang: 'yin' | 'yang';
}

export interface SajuResult {
  yearPillar: SajuPillar;
  monthPillar: SajuPillar;
  dayPillar: SajuPillar;
  hourPillar: SajuPillar;
  mainElement: Element;
  lackingElement: Element;
  strongElements: Element[];
  weakElements: Element[];
  overallEnergy: number;
  birthDate: string;
  birthTime?: string;
}

// Naming types
export interface NamingInput {
  parent1Saju: SajuResult;
  parent2Saju?: SajuResult;
  babyBirthDate?: string;
  babyBirthTime?: string;
  gender: Gender;
  hangryeolChar?: string;
  siblingNames?: string[];
  preferences?: {
    preferredElements?: Element[];
    avoidChars?: string[];
  };
}

export interface SuggestedName {
  name: string;
  hanja: string;
  reasonShort: string;
  sajuScore: number;
  element?: Element;
}

export interface StrokeAnalysis {
  totalStrokes: number;
  heavenGrade: number;
  humanGrade: number;
  earthGrade: number;
  outerGrade: number;
  totalGrade: number;
  luckScore: number;
}

export interface NamingReport {
  name: string;
  hanja: string;
  strokeAnalysis: StrokeAnalysis;
  yinYangFiveElements: {
    elements: Element[];
    balance: string;
    recommendation: string;
  };
  pronunciationAnalysis: {
    harmony: number;
    initialConsonants: string[];
    comment: string;
  };
  meaningBreakdown: { char: string; hanja: string; meaning: string }[];
  sajuFitScore: number;
  parentCompatibility: { mom: number; dad: number; combined: number };
  overallComment: string;
  englishNames?: EnglishNameSuggestion[];
}

export interface EnglishNameSuggestion {
  englishName: string;
  matchType: EnglishNameOption;
  reason: string;
  pronunciation: string;
}

export interface TaemyeongSuggestion {
  name: string;
  meaning: string;
  element?: Element;
}

export interface QuickReview {
  fitScore: number;
  comment: string;
  shouldPullCard: boolean;
  cardPullMessage?: string;
}

export interface SiblingCompatibility {
  compatibilityScore: number;
  positiveAspects: string[];
  challenges: string[];
  optimalBirthPeriods: string[];
  overallComment: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'use' | 'reward' | 'refund';
  description: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  category: string;
  title?: string;
  content: string;
  image_urls?: string[];
  like_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  user?: { nickname: string; avatar_url?: string };
}

export interface GachaProbability {
  grade: Grade;
  probability: number;
  pity_threshold?: number;
}
