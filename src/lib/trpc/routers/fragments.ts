import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

type FragmentTransaction = {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string | null;
  balance_after: number;
  reference_id: string | null;
  created_at: string;
};

export const fragmentsRouter = createTRPCRouter({
  // 현재 운명의 조각 잔액 조회
  getBalance: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data } = await ctx.supabase
          .from('users')
          .select('destiny_fragments')
          .eq('id', ctx.user.id)
          .single();
        return { fragments: (data as { destiny_fragments?: number } | null)?.destiny_fragments || 0 };
      } catch (e) {
        console.warn('[fragments] getBalance failed:', e);
        return { fragments: 0 };
      }
    }),

  // 운명의 조각 거래 내역 조회
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(50),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data } = await ctx.supabase
          .from('fragment_transactions')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('created_at', { ascending: false })
          .limit(input.limit);
        return { transactions: (data || []) as FragmentTransaction[] };
      } catch (e) {
        console.warn('[fragments] getHistory failed:', e);
        return { transactions: [] as FragmentTransaction[] };
      }
    }),

  // 결제 주문 생성 (Toss 위젯 호출 전)
  createOrder: protectedProcedure
    .input(z.object({
      packageId: z.enum(['handful', 'pouch', 'pouch_large', 'golden_jar']),
    }))
    .mutation(async ({ ctx, input }) => {
      const packages = {
        handful:     { fragments: 10,  price: 1200,  name: '한 줌' },
        pouch:       { fragments: 30,  price: 3000,  name: '작은 보따리' },
        pouch_large: { fragments: 100, price: 8000,  name: '복주머니' },
        golden_jar:  { fragments: 300, price: 20000, name: '황금 항아리' },
      };
      const pkg = packages[input.packageId];
      const orderId = `frag_${ctx.user.id.slice(0, 8)}_${Date.now()}`;

      const { error } = await ctx.supabase.from('payment_orders').insert({
        id: orderId,
        user_id: ctx.user.id,
        pack_id: input.packageId,
        credits: pkg.fragments,
        amount: pkg.price,
        status: 'pending',
      });

      if (error) {
        console.error('[fragments] createOrder failed:', error);
        throw new Error('주문 생성에 실패했습니다.');
      }

      return {
        orderId,
        amount: pkg.price,
        orderName: `운명의 조각 - ${pkg.name} (${pkg.fragments}개)`,
      };
    }),

  // 레거시: 결제 없이 조각 지급 (테스트/어드민 전용)
  purchase: protectedProcedure
    .input(z.object({
      packageId: z.enum(['handful', 'pouch', 'pouch_large', 'golden_jar']),
    }))
    .mutation(async ({ ctx, input }) => {
      const packages = {
        handful:     { fragments: 10,  price: 1200,  name: '한 줌' },
        pouch:       { fragments: 30,  price: 3000,  name: '작은 보따리' },
        pouch_large: { fragments: 100, price: 8000,  name: '복주머니' },
        golden_jar:  { fragments: 300, price: 20000, name: '황금 항아리' },
      };
      const pkg = packages[input.packageId];
      const orderId = `frag_order_${ctx.user.id}_${Date.now()}`;

      const { error: rpcError } = await ctx.supabase.rpc('add_fragments', {
        p_user_id: ctx.user.id,
        p_amount: pkg.fragments,
        p_type: 'purchase',
        p_description: `운명의 조각 구매 - ${pkg.name} (주문: ${orderId})`,
      });

      let newBalance = pkg.fragments;

      if (rpcError) {
        console.warn('[fragments] rpc add_fragments failed, using manual fallback:', rpcError);
        try {
          const { data: user } = await ctx.supabase
            .from('users')
            .select('destiny_fragments')
            .eq('id', ctx.user.id)
            .single();

          const currentBalance = (user as { destiny_fragments?: number } | null)?.destiny_fragments || 0;
          newBalance = currentBalance + pkg.fragments;

          await ctx.supabase
            .from('users')
            .update({ destiny_fragments: newBalance })
            .eq('id', ctx.user.id);

          await ctx.supabase.from('fragment_transactions').insert({
            user_id: ctx.user.id,
            amount: pkg.fragments,
            type: 'purchase',
            description: `운명의 조각 구매 - ${pkg.name} (주문: ${orderId})`,
          });
        } catch (e) {
          console.warn('[fragments] manual fallback failed:', e);
        }
      } else {
        try {
          const { data: user } = await ctx.supabase
            .from('users')
            .select('destiny_fragments')
            .eq('id', ctx.user.id)
            .single();
          newBalance = (user as { destiny_fragments?: number } | null)?.destiny_fragments || pkg.fragments;
        } catch (e) {
          console.warn('[fragments] getBalance after rpc failed:', e);
        }
      }

      return {
        success: true,
        orderId,
        fragments: pkg.fragments,
        newBalance,
      };
    }),

  // 신규 가입 보너스 지급
  addSignupBonus: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // 이미 가입 보너스를 받았는지 확인
        const { data: existing } = await ctx.supabase
          .from('fragment_transactions')
          .select('id')
          .eq('user_id', ctx.user.id)
          .eq('type', 'signup_bonus')
          .limit(1);

        if (existing && existing.length > 0) {
          return { success: false, fragments: 0 };
        }

        // 가입 보너스 지급
        const { error: rpcError } = await ctx.supabase.rpc('add_fragments', {
          p_user_id: ctx.user.id,
          p_amount: 5,
          p_type: 'signup_bonus',
          p_description: '신규 가입 보너스',
        });

        if (rpcError) {
          console.warn('[fragments] addSignupBonus rpc failed:', rpcError);
          return { success: false, fragments: 0 };
        }

        return { success: true, fragments: 5 };
      } catch (e) {
        console.warn('[fragments] addSignupBonus failed:', e);
        return { success: false, fragments: 0 };
      }
    }),
});
