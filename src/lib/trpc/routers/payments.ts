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
      } catch (e) {
        console.warn('[payments] insert payment_orders failed:', e);
        // table may not exist yet
      }

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
      // 버그 3 수정: 클라이언트 credits 값은 무시하고 DB에서 조회하므로 input에서 제거
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // DB에서 실제 주문의 credits 조회 (클라이언트 입력값 신뢰 금지)
        const { data: order, error: orderError } = await ctx.supabase
          .from('payment_orders')
          .select('credits, status, user_id')
          .eq('id', input.orderId)
          .eq('user_id', ctx.user.id)
          .single();

        if (orderError || !order) {
          console.warn('[payments] addCredits: order not found', input.orderId);
          return { success: false, error: 'Order not found' };
        }

        // 중복 지급 방지: 이미 completed인 주문은 건너뜀
        if ((order as { status: string }).status === 'completed') {
          console.warn('[payments] addCredits: order already completed', input.orderId);
          return { success: false, error: 'Order already completed' };
        }

        const credits = (order as { credits: number }).credits;

        // 원자적 크레딧 업데이트 (race condition 방지)
        const { error: rpcError } = await ctx.supabase.rpc('add_credits', {
          p_user_id: ctx.user.id,
          p_amount: credits,
        });

        if (rpcError) {
          console.warn('[payments] add_credits RPC failed, using manual fallback:', rpcError);
          const { data: user } = await ctx.supabase
            .from('users')
            .select('credits')
            .eq('id', ctx.user.id)
            .single();

          await ctx.supabase
            .from('users')
            .update({ credits: ((user as { credits?: number } | null)?.credits || 0) + credits })
            .eq('id', ctx.user.id);
        }

        await ctx.supabase.from('payment_orders')
          .update({ status: 'completed' })
          .eq('id', input.orderId);

        await ctx.supabase.from('credit_transactions').insert({
          user_id: ctx.user.id,
          amount: credits,
          type: 'purchase',
          description: `크레딧 구매 (주문: ${input.orderId})`,
        });
      } catch (e) {
        console.warn('[payments] addCredits failed:', e);
        // tables may not exist
      }

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
