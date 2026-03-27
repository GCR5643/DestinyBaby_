import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/lib/trpc/server';
import { generateDailyFortune } from '@/lib/llm/fortune-prompts';
import type { DailyFortune, SajuResult, Child } from '@/types';

export const dailyFortuneRouter = createTRPCRouter({
  // 게스트용: 로그인 없이 이름+생년월일로 운세 생성
  getGuestFortune: publicProcedure
    .input(z.object({
      childName: z.string().min(1).max(20),
      birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      birthTime: z.string().optional(), // HH:mm or empty
    }))
    .mutation(async ({ input }) => {
      const today = new Date().toISOString().split('T')[0];

      // 간단한 사주 정보 생성 (생년월일 기반 오행 추정)
      const birthMonth = parseInt(input.birthDate.split('-')[1]);
      const elementByMonth: Record<number, 'wood' | 'fire' | 'earth' | 'metal' | 'water'> = {
        1: 'water', 2: 'wood', 3: 'wood', 4: 'earth', 5: 'fire', 6: 'fire',
        7: 'earth', 8: 'metal', 9: 'metal', 10: 'earth', 11: 'water', 12: 'water',
      };
      const mainElement = elementByMonth[birthMonth] || 'wood';

      try {
        const cards = await generateDailyFortune(
          input.childName,
          { mainElement, lackingElement: mainElement === 'water' ? 'fire' : 'water', dayPillar: { heavenlyStem: '미상' }, strongElements: [mainElement], weakElements: [] } as unknown as SajuResult,
          today,
        );
        return { success: true as const, cards };
      } catch (err) {
        console.error('[guestFortune] LLM failed:', err);
        // fallback은 fortune-prompts의 getDefaultFortuneCards에서 처리됨
        const { getDefaultFortuneCards } = await import('@/lib/llm/fortune-prompts');
        return { success: true as const, cards: getDefaultFortuneCards(input.childName, mainElement) };
      }
    }),

  // Generate (or return cached) daily fortune for a child
  // 첫 번째 아이는 하루 1회 무료, 추가 아이는 조각 1개 차감
  getDailyFortune: protectedProcedure
    .input(z.object({
      childId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const today = new Date().toISOString().split('T')[0];

      // Check DB cache first (free re-view on same day)
      try {
        const { data: cached } = await ctx.supabase
          .from('daily_fortunes')
          .select('*')
          .eq('child_id', input.childId)
          .eq('fortune_date', today)
          .single();

        if (cached) {
          return {
            success: true as const,
            fortune: cached as DailyFortune,
            wasFree: false,
          };
        }
      } catch {
        // Not found — continue to generate
      }

      // 오늘 이미 무료로 생성한 운수가 있는지 확인
      let todayFortuneCount = 0;
      try {
        const { count } = await ctx.supabase
          .from('daily_fortunes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', ctx.user.id)
          .eq('fortune_date', today);
        todayFortuneCount = count ?? 0;
      } catch {
        // table may not exist
      }

      // 첫 번째 아이(오늘 첫 운세)는 무료
      const isFree = todayFortuneCount === 0;

      if (!isFree) {
        // 추가 아이는 조각 1개 차감
        let deductOk = false;
        try {
          const { error: rpcError } = await ctx.supabase.rpc('deduct_fragments', {
            p_user_id: ctx.user.id,
            p_amount: 1,
            p_type: 'fortune_spend',
            p_description: '오늘의 운수 열람 (추가 아이)',
          });
          if (!rpcError) {
            deductOk = true;
          }
        } catch {
          // RPC unavailable
        }

        if (!deductOk) {
          const { data: userData } = await ctx.supabase
            .from('users')
            .select('destiny_fragments')
            .eq('id', ctx.user.id)
            .single();

          const currentBalance = (userData as { destiny_fragments?: number } | null)?.destiny_fragments ?? 0;

          if (currentBalance < 1) {
            return {
              success: false as const,
              error: 'insufficient_fragments' as const,
              balance: currentBalance,
              wasFree: false,
            };
          }

          await ctx.supabase
            .from('users')
            .update({ destiny_fragments: currentBalance - 1 })
            .eq('id', ctx.user.id);

          try {
            await ctx.supabase.from('fragment_transactions').insert({
              user_id: ctx.user.id,
              amount: -1,
              type: 'fortune_spend',
              description: '오늘의 운수 열람 (추가 아이)',
            });
          } catch {
            // table may not exist yet
          }
        }
      }

      // Fetch child data
      const { data: childData, error: childError } = await ctx.supabase
        .from('children')
        .select('name, saju_data')
        .eq('id', input.childId)
        .eq('user_id', ctx.user.id)
        .single();

      if (childError || !childData) {
        // Refund fragment on failure (무료였으면 환불 불필요)
        if (!isFree) await refundFragment(ctx.supabase, ctx.user.id, 'children 조회 실패로 운수 생성 취소');
        return {
          success: false as const,
          error: 'child_not_found' as const,
          balance: 0,
        };
      }

      const child = childData as Pick<Child, 'name' | 'saju_data'>;

      // Generate fortune via LLM
      let cards;
      try {
        cards = await generateDailyFortune(
          child.name,
          child.saju_data as SajuResult | undefined,
          today,
        );
      } catch (err) {
        console.error('[dailyFortune] LLM generation failed:', err);
        if (!isFree) await refundFragment(ctx.supabase, ctx.user.id, 'LLM 오류로 운수 생성 취소');
        return {
          success: false as const,
          error: 'generation_failed' as const,
          balance: 0,
        };
      }

      // Persist to daily_fortunes
      const { data: inserted, error: insertError } = await ctx.supabase
        .from('daily_fortunes')
        .insert({
          child_id: input.childId,
          user_id: ctx.user.id,
          fortune_date: today,
          fortune_data: cards,
          fragment_cost: isFree ? 0 : 1,
        })
        .select('id, fortune_date, fortune_data, created_at, child_id, user_id, fragment_cost')
        .single();

      if (insertError || !inserted) {
        console.error('[dailyFortune] Insert failed:', insertError);
        if (!isFree) await refundFragment(ctx.supabase, ctx.user.id, 'DB 저장 실패로 운수 생성 취소');
        return {
          success: false as const,
          error: 'save_failed' as const,
          balance: 0,
        };
      }

      return {
        success: true as const,
        fortune: inserted as DailyFortune,
        wasFree: isFree,
      };
    }),

  // Check whether today's fortune already exists (no fragment cost)
  hasTodayFortune: protectedProcedure
    .input(z.object({
      childId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const today = new Date().toISOString().split('T')[0];

      try {
        const { data } = await ctx.supabase
          .from('daily_fortunes')
          .select('*')
          .eq('child_id', input.childId)
          .eq('fortune_date', today)
          .single();

        if (data) {
          return { hasFortune: true as const, fortune: data as DailyFortune };
        }
      } catch {
        // Not found
      }

      return { hasFortune: false as const };
    }),

  // Get fortune history for a child
  getHistory: protectedProcedure
    .input(z.object({
      childId: z.string().uuid(),
      limit: z.number().min(1).max(30).optional().default(7),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data } = await ctx.supabase
          .from('daily_fortunes')
          .select('*')
          .eq('child_id', input.childId)
          .eq('user_id', ctx.user.id)
          .order('fortune_date', { ascending: false })
          .limit(input.limit);

        return { fortunes: (data ?? []) as DailyFortune[] };
      } catch {
        return { fortunes: [] };
      }
    }),
});

// Helper: refund 1 fragment after a failed generation
async function refundFragment(
  supabase: SupabaseClient,
  userId: string,
  description: string,
): Promise<void> {
  try {
    const { error } = await supabase.rpc('add_fragments', {
      p_user_id: userId,
      p_amount: 1,
      p_type: 'refund',
      p_description: description,
    });
    if (error) throw error;
  } catch {
    // Manual fallback refund
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('destiny_fragments')
        .eq('id', userId)
        .single();
      const bal = (userData as { destiny_fragments?: number } | null)?.destiny_fragments ?? 0;
      await supabase.from('users').update({ destiny_fragments: bal + 1 }).eq('id', userId);
      await supabase.from('fragment_transactions').insert({
        user_id: userId,
        amount: 1,
        type: 'refund',
        description,
      });
    } catch (e) {
      console.error('[dailyFortune] Refund failed:', e);
    }
  }
}
