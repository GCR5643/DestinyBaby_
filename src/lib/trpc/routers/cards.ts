import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../server';
import type { Grade, Element, Card, CardSajuExplanation, SajuResult } from '@/types';
import { calculateSajuBoost, weightedElementPick } from '@/lib/saju/card-matcher';
import { pickCardTemplate } from '@/lib/cards/card-catalog';

export interface SajuConnectionInfo {
  matchedElement: Element;
  sajuReason: string;
  probabilityBoost: number;
  dominantPillar: string;
  elementBalance: string;
}

const PROBABILITIES: { grade: Grade; weight: number }[] = [
  { grade: 'N', weight: 40 },
  { grade: 'R', weight: 30 },
  { grade: 'SR', weight: 15 },
  { grade: 'SSR', weight: 8 },
  { grade: 'UR', weight: 4 },
  { grade: 'SSS', weight: 3 },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CARD_NAMES: Record<Element, string[]> = {
  wood: ['봄의 기운', '초록의 힘', '새싹의 성장', '나무의 지혜', '숲의 수호자'],
  fire: ['불꽃의 의지', '태양의 빛', '화염의 열정', '붉은 에너지', '여름의 기운'],
  earth: ['대지의 힘', '황금 들판', '흙의 포용', '산의 안정', '중심의 기운'],
  metal: ['금속의 날카로움', '서리의 결의', '가을의 기운', '강철의 의지', '빛나는 보석'],
  water: ['흐르는 물', '겨울의 지혜', '깊은 바다', '유연한 기운', '달의 신비'],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GRADE_DESCRIPTIONS: Record<Grade, string> = {
  N: '기본 운세 카드',
  R: '행운의 기운이 담긴 카드',
  SR: '좋은 운세가 깃든 카드',
  SSR: '강력한 운명의 카드',
  UR: '신비로운 천운의 카드',
  SSS: '전설의 운명 카드',
};

const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

function weightedPull(probabilities: { grade: Grade; weight: number }[]): Grade {
  const total = probabilities.reduce((sum, p) => sum + p.weight, 0);
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  let rand = (bytes[0] / 0xFFFFFFFF) * total;
  for (const p of probabilities) {
    rand -= p.weight;
    if (rand <= 0) return p.grade;
  }
  return probabilities[probabilities.length - 1].grade;
}

function generateCard(grade: Grade, elementBoosts?: Record<Element, number>): Card {
  const element = elementBoosts
    ? weightedElementPick(elementBoosts)
    : ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];

  // 카탈로그에서 매칭되는 카드 템플릿 조회
  const template = pickCardTemplate(grade, element);

  return {
    id: crypto.randomUUID(),
    name: template.name,
    grade,
    element,
    description: template.ability,
  };
}

const ELEMENT_KOREAN: Record<Element, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};

const ELEMENT_EMOJI: Record<Element, string> = {
  wood: '🌿', fire: '🔥', earth: '🌍', metal: '⚔️', water: '💧',
};

const CAREER_HINTS: Record<Element, string> = {
  wood: '교육/성장 분야의 재능과 연결됩니다',
  fire: '예술/표현 분야의 재능과 연결됩니다',
  earth: '돌봄/안정 분야의 재능과 연결됩니다',
  metal: '기술/정밀 분야의 재능과 연결됩니다',
  water: '직관/탐구 분야의 재능과 연결됩니다',
};

// 사주 오행 분포 계산
function countElements(saju: SajuResult): Record<Element, number> {
  const counts: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar];
  for (const p of pillars) {
    if (p) counts[p.element] = (counts[p.element] ?? 0) + 1;
  }
  return counts;
}

// 상생 관계
const GENERATES: Record<Element, Element> = {
  wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood',
};

function generateExplanation(card: Card, saju: SajuResult): CardSajuExplanation {
  const cardElement = card.element ?? saju.mainElement;
  const elementKr = ELEMENT_KOREAN[cardElement];
  const elementEmoji = ELEMENT_EMOJI[cardElement];
  const counts = countElements(saju);
  const dayPillarStem = saju.dayPillar.heavenlyStem;
  const mainKr = ELEMENT_KOREAN[saju.mainElement];
  const generates = GENERATES[saju.mainElement];
  const generatesKr = ELEMENT_KOREAN[generates];

  const mainCount = counts[saju.mainElement] ?? 0;
  const cardCount = counts[cardElement] ?? 0;

  // 확률 보정: 주원소 일치 시 +15%, 상생 시 +10%, 기타 +5%
  let probabilityBoost = 5;
  if (cardElement === saju.mainElement) probabilityBoost = 15;
  else if (generates === cardElement) probabilityBoost = 10;

  const sajuConnection = `우리 아이의 일간 ${dayPillarStem}이 ${elementKr}를 불러왔어요`;

  let elementBoost: string;
  if (generates === cardElement) {
    elementBoost = `사주에 ${mainKr}이 ${mainCount}개로 ${mainKr}生${generatesKr}의 상생 에너지가 흘러요`;
  } else {
    elementBoost = `사주에 ${elementKr}가 ${cardCount}개로 ${elementKr} 오행 기운이 깊어요`;
  }

  return {
    headline: `${elementKr}의 기운이 발현되었습니다 ${elementEmoji}`,
    sajuConnection,
    elementBoost,
    careerHint: `이 카드의 기운은 ${CAREER_HINTS[cardElement]}`,
    probabilityBoost,
  };
}

// 사주 연결 정보 생성
function buildSajuConnection(card: Card, saju: SajuResult): SajuConnectionInfo {
  const cardElement = card.element ?? saju.mainElement;
  const elementKr = ELEMENT_KOREAN[cardElement];
  const boost = calculateSajuBoost(saju);
  const probabilityBoost = Math.round((boost.elementBoosts[cardElement] - 1) * 100);
  const counts = countElements(saju);
  const count = counts[cardElement] ?? 0;
  const strongestPillar = saju.dayPillar.heavenlyStem;

  return {
    matchedElement: cardElement,
    sajuReason: `아이 사주의 일간 ${saju.dayPillar.heavenlyStem}(${elementKr})의 기운이 이 카드를 끌어당겼어요`,
    probabilityBoost,
    dominantPillar: `${strongestPillar}의 ${elementKr} 기운이 강하게 작용했어요`,
    elementBalance: `아이 사주에서 ${elementKr}가 ${count}개로 ${count >= 3 ? '가장 강해요' : '조화를 이루고 있어요'}`,
  };
}

// users 테이블에서 사주 데이터 조회 (없으면 null)
async function fetchUserSaju(
  supabase: import('@supabase/supabase-js').SupabaseClient,
  userId: string
): Promise<SajuResult | null> {
  try {
    const { data } = await supabase
      .from('users')
      .select('saju_data')
      .eq('id', userId)
      .single();
    if (data && (data as Record<string, unknown>).saju_data) {
      return (data as Record<string, unknown>).saju_data as SajuResult;
    }
    // children 테이블에서도 시도
    const { data: childData } = await supabase
      .from('children')
      .select('saju_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (childData && (childData as Record<string, unknown>).saju_data) {
      return (childData as Record<string, unknown>).saju_data as SajuResult;
    }
    return null;
  } catch {
    return null;
  }
}

export const cardsRouter = createTRPCRouter({
  pullCards: protectedProcedure
    .input(z.object({ count: z.union([z.literal(1), z.literal(10)]) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { count } = input;

      // Determine credits needed and free pulls
      let freePullsUsed = 0;
      let creditsUsed = 0;

      try {
        // Get user's current free_pulls_used from DB
        const { data: userData, error: userError } = await ctx.supabase
          .from('users')
          .select('credits, free_pulls_used')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          throw new Error('User not found');
        }

        const currentFreePulls: number = userData.free_pulls_used ?? 0;
        const FREE_PULLS_TOTAL = 3;
        const remainingFree = Math.max(0, FREE_PULLS_TOTAL - currentFreePulls);

        // Calculate how many pulls are free vs paid
        const freePullsThisRound = Math.min(count, remainingFree);
        const paidPulls = count - freePullsThisRound;

        // 10-pull discount: 9 credits instead of 10
        const creditCost = count === 10 ? 9 : paidPulls;

        if (paidPulls > 0 && userData.credits < creditCost) {
          throw new Error('크레딧이 부족합니다');
        }

        freePullsUsed = freePullsThisRound;
        creditsUsed = paidPulls > 0 ? creditCost : 0;

        // 사주 데이터 미리 조회 (카드 생성 전)
        const sajuForPull = await fetchUserSaju(ctx.supabase, userId);
        const pullBoost = sajuForPull ? calculateSajuBoost(sajuForPull) : null;

        // Generate cards (사주 boost 적용)
        const cards: Card[] = Array.from({ length: count }, () =>
          generateCard(weightedPull(PROBABILITIES), pullBoost?.elementBoosts)
        );

        // Try to insert into user_cards table (may not exist yet)
        try {
          // First try to insert cards into cards table
          const cardInserts = cards.map(card => ({
            id: card.id,
            name: card.name,
            grade: card.grade,
            element: card.element,
            description: card.description,
          }));

          await ctx.supabase.from('cards').insert(cardInserts);

          // Insert into user_cards
          const userCardInserts = cards.map(card => ({
            user_id: userId,
            card_id: card.id,
            obtained_at: new Date().toISOString(),
            is_favorite: false,
          }));

          await ctx.supabase.from('user_cards').insert(userCardInserts);
        } catch (e) {
          console.warn('[cards] insert cards/user_cards failed:', e);
          // Tables may not exist yet — proceed with mock data flow
        }

        // Update user credits and free_pulls_used
        try {
          await ctx.supabase
            .from('users')
            .update({
              credits: userData.credits - creditsUsed,
              free_pulls_used: currentFreePulls + freePullsThisRound,
              total_pulls: ((userData as Record<string, number>).total_pulls ?? 0) + count,
            })
            .eq('id', userId);
        } catch (e) {
          console.warn('[cards] update user credits/free_pulls_used failed:', e);
          // Ignore update errors if columns don't exist
        }

        // 사주 기반 설명 및 연결 정보 생성 (로그인 유저만, 이미 조회한 sajuForPull 재사용)
        const lastCard = cards[cards.length - 1];
        const explanation = sajuForPull && lastCard
          ? generateExplanation(lastCard, sajuForPull)
          : null;
        const sajuConnection = sajuForPull && lastCard
          ? buildSajuConnection(lastCard, sajuForPull)
          : null;

        return { cards, creditsUsed, freePullsUsed, explanation, sajuConnection };
      } catch (err) {
        throw err;
      }
    }),

  getCollection: protectedProcedure
    .input(z.object({ page: z.number().default(1), pageSize: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { page, pageSize } = input;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      try {
        const { data, error, count } = await ctx.supabase
          .from('user_cards')
          .select('*, card:cards(*)', { count: 'exact' })
          .eq('user_id', userId)
          .order('obtained_at', { ascending: false })
          .range(from, to);

        if (error) throw error;

        return { cards: data ?? [], total: count ?? 0 };
      } catch (e) {
        console.warn('[cards] getCollection failed:', e);
        return { cards: [], total: 0 };
      }
    }),

  toggleFavorite: protectedProcedure
    .input(z.object({ userCardId: z.string(), isFavorite: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { error } = await ctx.supabase
          .from('user_cards')
          .update({ is_favorite: input.isFavorite })
          .eq('id', input.userCardId)
          .eq('user_id', ctx.user.id);

        if (error) throw error;
        return { success: true };
      } catch (e) {
        console.warn('[cards] toggleFavorite failed:', e);
        return { success: false };
      }
    }),

  getProbabilities: publicProcedure.query(() => {
    return PROBABILITIES.map(p => ({
      grade: p.grade,
      probability: p.weight,
    }));
  }),

  // 매일 무료 1회 뽑기
  dailyFreePull: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    try {
      const { data: userData, error: userError } = await ctx.supabase
        .from('users')
        .select('last_free_pull_date')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const lastPullDate = (userData as { last_free_pull_date?: string | null }).last_free_pull_date;

      if (lastPullDate === todayStr) {
        // 오늘 이미 뽑음 — 다음 무료 뽑기까지 남은 초 계산
        const now = new Date();
        const tomorrowMidnight = new Date(now);
        tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
        tomorrowMidnight.setHours(0, 0, 0, 0);
        const secondsUntilReset = Math.ceil(
          (tomorrowMidnight.getTime() - now.getTime()) / 1000
        );
        throw new Error(`ALREADY_PULLED:${secondsUntilReset}`);
      }

      // 사주 데이터 조회 (카드 생성 전)
      const dailySaju = await fetchUserSaju(ctx.supabase, userId);
      const dailyBoost = dailySaju ? calculateSajuBoost(dailySaju) : null;

      // 무료 뽑기 실행 (사주 boost 적용)
      const grade = weightedPull(PROBABILITIES);
      const card = generateCard(grade, dailyBoost?.elementBoosts);

      // cards / user_cards 삽입 시도
      try {
        await ctx.supabase.from('cards').insert({
          id: card.id,
          name: card.name,
          grade: card.grade,
          element: card.element,
          description: card.description,
        });
        await ctx.supabase.from('user_cards').insert({
          user_id: userId,
          card_id: card.id,
          obtained_at: new Date().toISOString(),
          is_favorite: false,
        });
      } catch (e) {
        console.warn('[cards] dailyFreePull insert cards/user_cards failed:', e);
      }

      // last_free_pull_date 업데이트
      try {
        await ctx.supabase
          .from('users')
          .update({ last_free_pull_date: todayStr })
          .eq('id', userId);
      } catch (e) {
        console.warn('[cards] dailyFreePull update last_free_pull_date failed:', e);
      }

      // 사주 기반 설명 및 연결 정보 생성 (dailySaju 재사용)
      const explanation = dailySaju ? generateExplanation(card, dailySaju) : null;
      const sajuConnection = dailySaju ? buildSajuConnection(card, dailySaju) : null;

      return { card, success: true, explanation, sajuConnection };
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('ALREADY_PULLED:')) {
        const seconds = parseInt(err.message.split(':')[1], 10);
        throw new Error(`ALREADY_PULLED:${seconds}`);
      }
      throw err;
    }
  }),

  // 확률 공개용 — gacha_probability_config 테이블에서 조회, 없으면 기본값 반환
  getProbabilityConfig: publicProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await ctx.supabase
        .from('gacha_probability_config')
        .select('grade, probability')
        .order('probability', { ascending: false });

      if (error || !data || data.length === 0) {
        throw new Error('no data');
      }

      return (data as { grade: string; probability: number }[]).map(row => ({
        grade: row.grade,
        probability: row.probability,
      }));
    } catch {
      // 테이블 미존재 시 기본 확률 반환
      return PROBABILITIES.map(p => ({
        grade: p.grade as string,
        probability: p.weight,
      }));
    }
  }),
});
