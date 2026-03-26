import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { generateDailyFortune } from '@/lib/llm/fortune-prompts';
import type { DailyFortune, SajuResult, Child } from '@/types';

export const dailyFortuneRouter = createTRPCRouter({
  // Generate (or return cached) daily fortune for a child, costs 1 fragment
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
          };
        }
      } catch {
        // Not found — continue to generate
      }

      // Deduct 1 fragment via RPC, with manual fallback
      let deductOk = false;
      try {
        const { error: rpcError } = await ctx.supabase.rpc('deduct_fragments', {
          p_user_id: ctx.user.id,
          p_amount: 1,
          p_type: 'fortune_spend',
          p_description: '오늘의 운수 열람',
        });
        if (!rpcError) {
          deductOk = true;
        }
      } catch {
        // RPC unavailable — fall through to manual deduction
      }

      if (!deductOk) {
        // Manual balance check + deduction
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
            description: '오늘의 운수 열람',
          });
        } catch {
          // table may not exist yet
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
        // Refund fragment on failure
        await refundFragment(ctx.supabase, ctx.user.id, 'children 조회 실패로 운수 생성 취소');
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
        await refundFragment(ctx.supabase, ctx.user.id, 'LLM 오류로 운수 생성 취소');
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
          fragment_cost: 1,
        })
        .select('id, fortune_date, fortune_data, created_at, child_id, user_id, fragment_cost')
        .single();

      if (insertError || !inserted) {
        console.error('[dailyFortune] Insert failed:', insertError);
        await refundFragment(ctx.supabase, ctx.user.id, 'DB 저장 실패로 운수 생성 취소');
        return {
          success: false as const,
          error: 'save_failed' as const,
          balance: 0,
        };
      }

      return {
        success: true as const,
        fortune: inserted as DailyFortune,
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
