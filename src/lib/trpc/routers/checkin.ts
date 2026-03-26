import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

export const checkinRouter = createTRPCRouter({
  // 일일 출석체크
  doCheckin: protectedProcedure
    .mutation(async ({ ctx }) => {
      // DB 함수 호출 시도
      try {
        const { data, error } = await ctx.supabase.rpc('do_checkin', {
          p_user_id: ctx.user.id,
        });
        if (!error && data) {
          return data as {
            alreadyCheckedIn: boolean;
            streak: number;
            bonus_fragments: number;
            total_earned: number;
            new_balance: number;
          };
        }
      } catch (e) {
        console.warn('[checkin] rpc do_checkin failed, using fallback:', e);
      }

      // 폴백: 직접 로직 구현
      const today = new Date().toISOString().split('T')[0];

      try {
        // 오늘 이미 출석했는지 확인
        const { data: existing } = await ctx.supabase
          .from('checkin_records')
          .select('streak')
          .eq('user_id', ctx.user.id)
          .eq('checkin_date', today)
          .single();

        if (existing) {
          return {
            alreadyCheckedIn: true,
            streak: (existing as { streak: number }).streak,
          };
        }

        // 어제 출석 기록 조회 (연속 스트릭 계산)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const { data: yesterdayRecord } = await ctx.supabase
          .from('checkin_records')
          .select('streak')
          .eq('user_id', ctx.user.id)
          .eq('checkin_date', yesterdayStr)
          .single();

        const streak = yesterdayRecord
          ? (yesterdayRecord as { streak: number }).streak + 1
          : 1;

        // 보너스 계산
        let bonus = 0;
        if (streak % 30 === 0) {
          bonus = 10;
        } else if (streak % 14 === 0) {
          bonus = 5;
        } else if (streak % 7 === 0) {
          bonus = 3;
        }

        const totalEarned = 1 + bonus;

        // 출석 기록 삽입
        await ctx.supabase.from('checkin_records').insert({
          user_id: ctx.user.id,
          checkin_date: today,
          streak,
          bonus_fragments: bonus,
        });

        // 사용자 destiny_fragments 업데이트
        const { data: userData } = await ctx.supabase
          .from('users')
          .select('destiny_fragments')
          .eq('id', ctx.user.id)
          .single();

        const currentFragments =
          (userData as { destiny_fragments?: number } | null)
            ?.destiny_fragments ?? 0;
        const newBalance = currentFragments + totalEarned;

        await ctx.supabase
          .from('users')
          .update({ destiny_fragments: newBalance })
          .eq('id', ctx.user.id);

        // 기본 출석 조각 트랜잭션 기록
        await ctx.supabase.from('fragment_transactions').insert({
          user_id: ctx.user.id,
          amount: 1,
          type: 'checkin',
          description: `일일 출석체크 (${today})`,
        });

        // 보너스 조각 트랜잭션 기록
        if (bonus > 0) {
          await ctx.supabase.from('fragment_transactions').insert({
            user_id: ctx.user.id,
            amount: bonus,
            type: 'checkin_bonus',
            description: `출석 ${streak}일 연속 보너스`,
          });
        }

        return {
          alreadyCheckedIn: false,
          streak,
          bonus_fragments: bonus,
          total_earned: totalEarned,
          new_balance: newBalance,
        };
      } catch (e) {
        console.warn('[checkin] doCheckin fallback failed:', e);
        return {
          alreadyCheckedIn: false,
          streak: 1,
          bonus_fragments: 0,
          total_earned: 1,
          new_balance: 0,
        };
      }
    }),

  // 현재 연속 출석 스트릭 조회
  getStreak: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data } = await ctx.supabase
          .from('checkin_records')
          .select('checkin_date, streak')
          .eq('user_id', ctx.user.id)
          .order('checkin_date', { ascending: false })
          .limit(1);

        if (!data || data.length === 0) {
          return { streak: 0, checkedInToday: false, lastCheckinDate: null };
        }

        const latest = data[0] as { checkin_date: string; streak: number };
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const checkedInToday = latest.checkin_date === today;
        const streakAlive =
          checkedInToday || latest.checkin_date === yesterdayStr;

        return {
          streak: streakAlive ? latest.streak : 0,
          checkedInToday,
          lastCheckinDate: latest.checkin_date,
        };
      } catch (e) {
        console.warn('[checkin] getStreak failed:', e);
        return { streak: 0, checkedInToday: false, lastCheckinDate: null };
      }
    }),

  // 월별 출석 기록 조회
  getMonthlyHistory: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number().min(1).max(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const firstDay = `${input.year}-${String(input.month).padStart(2, '0')}-01`;
        const lastDayDate = new Date(input.year, input.month, 0);
        const lastDay = `${input.year}-${String(input.month).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;

        const { data } = await ctx.supabase
          .from('checkin_records')
          .select('checkin_date, streak, bonus_fragments')
          .eq('user_id', ctx.user.id)
          .gte('checkin_date', firstDay)
          .lte('checkin_date', lastDay)
          .order('checkin_date', { ascending: true });

        return {
          records: (data ?? []) as {
            checkin_date: string;
            streak: number;
            bonus_fragments: number;
          }[],
        };
      } catch (e) {
        console.warn('[checkin] getMonthlyHistory failed:', e);
        return { records: [] };
      }
    }),
});
