import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

export const paymentsRouter = createTRPCRouter({
  // Get current credit balance
  getBalance: protectedProcedure
    .query(async ({ ctx }) => {
      const { data } = await ctx.supabase
        .from('users')
        .select('credits')
        .eq('id', ctx.user.id)
        .single();
      return { credits: (data as { credits?: number } | null)?.credits || 0 };
    }),

  // Initiate credit purchase (returns TossPayments order data)
  initiatePurchase: protectedProcedure
    .input(z.object({
      packId: z.enum(['trial', 'basic', 'premium', 'royal']),
    }))
    .mutation(async ({ ctx, input }) => {
      const packs = {
        trial: { credits: 10, bonus: 0, price: 1900, name: '체험 팩' },
        basic: { credits: 30, bonus: 3, price: 4900, name: '기본 팩' },
        premium: { credits: 100, bonus: 15, price: 12900, name: '프리미엄 팩' },
        royal: { credits: 300, bonus: 50, price: 29900, name: '로열 팩' },
      };
      const pack = packs[input.packId];
      const orderId = `order_${ctx.user.id}_${Date.now()}`;

      // Store pending order in DB (create payment_orders table entry)
      try {
        await ctx.supabase.from('payment_orders').insert({
          id: orderId,
          user_id: ctx.user.id,
          pack_id: input.packId,
          credits: pack.credits + pack.bonus,
          amount: pack.price,
          status: 'pending',
        });
      } catch (e) { /* table may not exist yet */ }

      return {
        orderId,
        orderName: pack.name,
        amount: pack.price,
        credits: pack.credits,
        bonus: pack.bonus,
        totalCredits: pack.credits + pack.bonus,
      };
    }),

  // Add credits (called after payment confirmation)
  addCredits: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      credits: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: user } = await ctx.supabase
          .from('users')
          .select('credits')
          .eq('id', ctx.user.id)
          .single();

        await ctx.supabase
          .from('users')
          .update({ credits: ((user as { credits?: number } | null)?.credits || 0) + input.credits })
          .eq('id', ctx.user.id);

        await ctx.supabase.from('payment_orders')
          .update({ status: 'completed' })
          .eq('id', input.orderId);

        await ctx.supabase.from('credit_transactions').insert({
          user_id: ctx.user.id,
          amount: input.credits,
          type: 'purchase',
          description: `크레딧 구매 (주문: ${input.orderId})`,
        });
      } catch (e) { /* tables may not exist */ }

      return { success: true };
    }),

  // Get transaction history
  getTransactions: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data } = await ctx.supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        return { transactions: data || [] };
      } catch (e) {
        return { transactions: [] };
      }
    }),
});
