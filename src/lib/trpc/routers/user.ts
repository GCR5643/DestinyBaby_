import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

export const userRouter = createTRPCRouter({
  // Get full profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data } = await ctx.supabase
        .from('users')
        .select('*')
        .eq('id', ctx.user.id)
        .single();
      return { profile: data };
    } catch (e) {
      return { profile: null };
    }
  }),

  // Update profile (nickname, avatar)
  updateProfile: protectedProcedure
    .input(z.object({
      nickname: z.string().optional(),
      avatar_url: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.supabase
          .from('users')
          .update(input)
          .eq('id', ctx.user.id);
      } catch (e) {
        console.warn('[user] updateProfile failed:', e);
        // table may not exist
      }
      return { success: true };
    }),

  // Get children (복수 자녀 지원)
  getChildren: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data } = await ctx.supabase
        .from('children')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false });
      return { children: data || [] };
    } catch (e) {
      return { children: [] };
    }
  }),

  addChild: protectedProcedure
    .input(z.object({
      name: z.string(),
      birth_date: z.string().optional(),
      birth_time: z.string().optional(),
      gender: z.enum(['male', 'female', 'unknown']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data } = await ctx.supabase
          .from('children')
          .insert({
            user_id: ctx.user.id,
            name: input.name,
            birth_date: input.birth_date,
            birth_time: input.birth_time,
            gender: input.gender,
          })
          .select()
          .single();
        return { child: data };
      } catch (e) {
        return { child: null };
      }
    }),

  // Get user stats (total pulls, cards count, naming requests)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [pullsData, cardsData, namingData] = await Promise.all([
        ctx.supabase.from('users').select('total_pulls').eq('id', ctx.user.id).single(),
        ctx.supabase.from('user_cards').select('id', { count: 'exact' }).eq('user_id', ctx.user.id),
        ctx.supabase.from('naming_requests').select('id', { count: 'exact' }).eq('user_id', ctx.user.id),
      ]);
      return {
        totalPulls: (pullsData.data as { total_pulls?: number } | null)?.total_pulls || 0,
        cardCount: cardsData.count || 0,
        namingCount: namingData.count || 0,
      };
    } catch (e) {
      return { totalPulls: 0, cardCount: 0, namingCount: 0 };
    }
  }),
});
