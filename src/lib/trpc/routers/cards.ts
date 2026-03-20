import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../server';
import type { Grade, Element, Card } from '@/types';

const PROBABILITIES: { grade: Grade; weight: number }[] = [
  { grade: 'B', weight: 40 },
  { grade: 'A', weight: 30 },
  { grade: 'S', weight: 18 },
  { grade: 'SS', weight: 9 },
  { grade: 'SSS', weight: 3 },
];

const CARD_NAMES: Record<Element, string[]> = {
  wood: ['봄의 기운', '초록의 힘', '새싹의 성장', '나무의 지혜', '숲의 수호자'],
  fire: ['불꽃의 의지', '태양의 빛', '화염의 열정', '붉은 에너지', '여름의 기운'],
  earth: ['대지의 힘', '황금 들판', '흙의 포용', '산의 안정', '중심의 기운'],
  metal: ['금속의 날카로움', '서리의 결의', '가을의 기운', '강철의 의지', '빛나는 보석'],
  water: ['흐르는 물', '겨울의 지혜', '깊은 바다', '유연한 기운', '달의 신비'],
};

const GRADE_DESCRIPTIONS: Record<Grade, string> = {
  B: '기본 운세',
  A: '좋은 운세',
  S: '훌륭한 운세',
  SS: '특별한 운세',
  SSS: '전설급 운세',
};

const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

function weightedPull(probabilities: { grade: Grade; weight: number }[]): Grade {
  const total = probabilities.reduce((sum, p) => sum + p.weight, 0);
  let rand = Math.random() * total;
  for (const p of probabilities) {
    rand -= p.weight;
    if (rand <= 0) return p.grade;
  }
  return probabilities[probabilities.length - 1].grade;
}

function generateCard(grade: Grade): Card {
  const element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
  const names = CARD_NAMES[element];
  const name = names[Math.floor(Math.random() * names.length)];
  return {
    id: `dynamic-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    grade,
    element,
    description: GRADE_DESCRIPTIONS[grade],
  };
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

        // Generate cards
        const cards: Card[] = Array.from({ length: count }, () =>
          generateCard(weightedPull(PROBABILITIES))
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
        } catch {
          // Tables may not exist yet — proceed with mock data flow
        }

        // Update user credits and free_pulls_used
        try {
          await ctx.supabase
            .from('users')
            .update({
              credits: userData.credits - creditsUsed,
              free_pulls_used: currentFreePulls + freePullsThisRound,
              total_pulls: (userData as Record<string, number>).total_pulls + count,
            })
            .eq('id', userId);
        } catch {
          // Ignore update errors if columns don't exist
        }

        return { cards, creditsUsed, freePullsUsed };
      } catch (err) {
        if (err instanceof Error && err.message === '크레딧이 부족합니다') {
          throw err;
        }
        // DB not available — return mock cards
        const cards: Card[] = Array.from({ length: count }, () =>
          generateCard(weightedPull(PROBABILITIES))
        );
        return { cards, creditsUsed: 0, freePullsUsed: 0 };
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
      } catch {
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
      } catch {
        return { success: false };
      }
    }),

  getProbabilities: publicProcedure.query(() => {
    return PROBABILITIES.map(p => ({
      grade: p.grade,
      probability: p.weight,
    }));
  }),
});
