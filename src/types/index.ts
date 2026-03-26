export type Grade = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'SSS';
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
  pity_counter: number;
  destiny_fragments: number;
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

// 십성 타입
export type Sipsung =
  | '비견' | '겁재' | '식신' | '상관' | '편재'
  | '정재' | '편관' | '정관' | '편인' | '정인';

export interface SipsungResult {
  /** 가장 많이 나타나는 십성 (1-2개) */
  dominant: Sipsung[];
  /** 각 십성 출현 횟수 */
  distribution: Record<Sipsung, number>;
  /** 년주 천간의 십성 */
  yearSipsung: Sipsung;
  /** 월주 천간의 십성 */
  monthSipsung: Sipsung;
  /** 시주 천간의 십성 (시간 미상 시 null) */
  hourSipsung: Sipsung | null;
  /** 해석 문자열 */
  interpretation: string;
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
  hourPillar: SajuPillar | null;
  mainElement: Element;
  lackingElement: Element;
  strongElements: Element[];
  weakElements: Element[];
  overallEnergy: number;
  birthDate: string;
  birthTime?: string;
  /** 시간 미상으로 시주를 제외한 분석일 때 true */
  hourPillarExcluded?: boolean;
  /** 십성 분석 결과 */
  sipsung?: SipsungResult;
}

// 부모-자녀 사주 궁합 분석 결과
export interface ParentChildCompatibilityResult {
  overallScore: number; // 0-100
  summary: string; // 한줄 요약
  details: {
    elementBalance: { score: number; description: string }; // 오행 보완
    heavenlyStemHarmony: { score: number; description: string }; // 천간 합
    earthlyBranchHarmony: { score: number; description: string }; // 지지 합
    conflictAnalysis: { score: number; description: string }; // 충/형
    generativeRelation: { score: number; description: string }; // 상생
  };
  advice: string[]; // 조언 목록
  parentRole: 'father' | 'mother';
}

// Naming types
export type TrendLevel = 'trendy' | 'balanced' | 'classic';

export interface NamingInput {
  parent1Saju: SajuResult;
  parent2Saju?: SajuResult;
  babySaju?: SajuResult;
  babyBirthDate?: string;
  babyBirthTime?: string;
  gender: Gender;
  surname: string;
  surnameHanja?: string;
  hangryeolChar?: string;
  siblingNames?: string[];
  trendLevel?: TrendLevel;
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

export interface EumyangAnalysis {
  pattern: ('양' | '음')[];
  patternString: string;
  score: number;
  luck: '길' | '보통' | '흉';
  description: string;
}

export interface PronunciationOhengAnalysis {
  elements: ('木' | '火' | '土' | '金' | '水')[];
  pattern: string;
  relations: string[];
  score: number;
  description: string;
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
  eumyangAnalysis?: EumyangAnalysis;
  pronunciationOheng?: PronunciationOhengAnalysis;
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

export interface CardSajuExplanation {
  headline: string;
  sajuConnection: string;
  elementBoost: string;
  careerHint: string;
  probabilityBoost: number; // 0-20 사이 퍼센트
}

// ── Phase II: 오늘의 운수 + 운명의 조각 + 출석체크 ────────────────────────────

export interface FortuneCard {
  type: 'fortune' | 'praise' | 'love' | 'fact' | 'conversation' | 'parenting';
  emoji: string;
  title: string;
  content: string;
  color: string;
}

export interface DailyFortune {
  id: string;
  child_id: string;
  user_id: string;
  fortune_date: string;
  fortune_data: FortuneCard[];
  fragment_cost: number;
  created_at: string;
}

export interface CheckinRecord {
  id: string;
  user_id: string;
  checkin_date: string;
  streak: number;
  bonus_fragments: number;
  created_at: string;
}

export interface FragmentTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'checkin' | 'checkin_bonus' | 'purchase' | 'fortune_spend' | 'refund' | 'signup_bonus';
  description: string | null;
  balance_after: number;
  reference_id: string | null;
  created_at: string;
}

export interface CheckinResult {
  streak: number;
  bonus_fragments: number;
  total_earned: number;
  new_balance: number;
}

export interface FragmentPackage {
  id: string;
  name: string;
  fragments: number;
  price: number;
  unitPrice: number;
  discount?: string;
}
