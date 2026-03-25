import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../server';

export const birthdateRouter = createTRPCRouter({
  // 1. 탄생일 추천 요청
  recommendDates: publicProcedure
    .input(z.object({
      parent1BirthDate: z.string(),
      parent1BirthTime: z.string().optional(),
      parent2BirthDate: z.string().optional(),
      parent2BirthTime: z.string().optional(),
      babyGender: z.enum(['male', 'female', 'unknown']).default('unknown'),
      pregnancyStartDate: z.string().optional(),
      currentWeeks: z.number().optional(),
      dueDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      // 1) 예정일 기준 의학적 안정기 계산: dueDate - 7일 ~ dueDate + 14일
      const due = new Date(input.dueDate);
      const safeStart = new Date(due);
      safeStart.setDate(due.getDate() - 7);
      const safeEnd = new Date(due);
      safeEnd.setDate(due.getDate() + 14);

      // 2) 안정기 내 모든 날짜 생성
      const candidates: Date[] = [];
      const current = new Date(safeStart);
      while (current <= safeEnd) {
        candidates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      // 3) 각 날짜에 대해 사주 길일 점수 계산
      // 천간지지 기반 길일 판단 (간단 버전)
      const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
      const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

      const scoredDates = candidates.map(date => {
        const month = date.getMonth() + 1;

        let score = 50; // 기본 점수

        // 천간 기반 점수 (일진)
        const heavenlyStemIndex = Math.floor((date.getTime() / 86400000) % 10);
        const earthlyBranchIndex = Math.floor((date.getTime() / 86400000) % 12);

        // 길일 천간: 갑(0), 병(2), 정(3), 경(6), 임(8)
        if ([0, 2, 3, 6, 8].includes(heavenlyStemIndex)) score += 15;
        // 흉일 천간: 을(1), 신(7)
        if ([1, 7].includes(heavenlyStemIndex)) score -= 10;

        // 지지 기반 삼합(三合) 보너스
        if ([0, 4, 8].includes(earthlyBranchIndex)) score += 10; // 수국삼합
        if ([2, 6, 10].includes(earthlyBranchIndex)) score += 8; // 화국삼합

        // 부모 사주와 궁합 보너스 (간단)
        if (input.parent1BirthDate) {
          const p1 = new Date(input.parent1BirthDate);
          const p1Stem = Math.floor((p1.getTime() / 86400000) % 10);
          // 천간합 체크
          if (Math.abs(heavenlyStemIndex - p1Stem) === 5) score += 12;
        }

        // 성별 고려
        if (input.babyGender === 'male') {
          // 양일(陽日) 선호
          if (heavenlyStemIndex % 2 === 0) score += 5;
        } else if (input.babyGender === 'female') {
          // 음일(陰日) 선호
          if (heavenlyStemIndex % 2 === 1) score += 5;
        }

        // 월건(月建) 충돌 감점
        if (earthlyBranchIndex === (month + 1) % 12) score -= 15;

        score = Math.max(0, Math.min(100, score));

        return {
          date: date.toISOString().split('T')[0],
          score,
          dayPillar: `${HEAVENLY_STEMS[heavenlyStemIndex]}${EARTHLY_BRANCHES[earthlyBranchIndex]}`,
          reason: score >= 75 ? '천간지지 조화가 뛰어난 길일' :
                  score >= 60 ? '무난한 길일' :
                  score >= 45 ? '보통' : '피하는 것이 좋은 날',
        };
      });

      // 4) 상위 3개 추천
      const top3 = scoredDates
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      return {
        safeStart: safeStart.toISOString().split('T')[0],
        safeEnd: safeEnd.toISOString().split('T')[0],
        recommendedDates: top3,
        allDates: scoredDates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      };
    }),

  // 2. 길일 저장 (로그인 필요)
  saveLuckyDate: protectedProcedure
    .input(z.object({
      date: z.string(),
      time: z.string().optional(),
      score: z.number().optional(),
      sajuAnalysis: z.unknown().optional(),
      source: z.enum(['recommendation', 'manual', 'hospital']).default('recommendation'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('lucky_dates')
        .insert({
          user_id: ctx.user.id,
          date: input.date,
          time: input.time ?? null,
          score: input.score ?? 0,
          saju_analysis: (input.sajuAnalysis as Record<string, unknown>) ?? {},
          source: input.source,
          status: 'candidate',
        })
        .select()
        .single();

      if (error) {
        console.warn('[birthdate] saveLuckyDate failed:', error);
        throw new Error('길일 저장에 실패했습니다.');
      }
      return data;
    }),

  // 3. 내 길일 목록 조회
  getMyLuckyDates: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('lucky_dates')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('date', { ascending: true });

      if (error) {
        console.warn('[birthdate] getMyLuckyDates failed:', error);
        return [];
      }
      return data ?? [];
    }),

  // 4. 길일 수정 (날짜/시간 변경, 병원 메모 등)
  updateLuckyDate: protectedProcedure
    .input(z.object({
      id: z.string(),
      date: z.string().optional(),
      time: z.string().optional(),
      status: z.enum(['candidate', 'selected', 'confirmed', 'passed']).optional(),
      hospitalNote: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (input.date) updateData.date = input.date;
      if (input.time !== undefined) updateData.time = input.time;
      if (input.status) updateData.status = input.status;
      if (input.hospitalNote !== undefined) updateData.hospital_note = input.hospitalNote;

      const { data, error } = await ctx.supabase
        .from('lucky_dates')
        .update(updateData)
        .eq('id', input.id)
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) {
        console.warn('[birthdate] updateLuckyDate failed:', error);
        throw new Error('길일 수정에 실패했습니다.');
      }
      return data;
    }),

  // 5. 길일 삭제
  deleteLuckyDate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('lucky_dates')
        .delete()
        .eq('id', input.id)
        .eq('user_id', ctx.user.id);

      if (error) {
        console.warn('[birthdate] deleteLuckyDate failed:', error);
        throw new Error('길일 삭제에 실패했습니다.');
      }
      return { success: true };
    }),
});
