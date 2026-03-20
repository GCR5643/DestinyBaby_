import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/lib/trpc/server';
import { generateNames } from '@/lib/naming/name-generator';
import { analyzeName } from '@/lib/naming/name-analyzer';
import { reviewName } from '@/lib/naming/name-reviewer';
import { generateTaemyeong } from '@/lib/naming/taemyeong-generator';
import { generateEnglishNames } from '@/lib/naming/english-name-generator';
import { calculateSaju } from '@/lib/saju/saju-calculator';

interface PopularityData {
  recentCount: number;
  trend: 'rising' | 'stable' | 'falling' | 'new';
  trendPercent: number;
  rank: number;
}

// 인기 한국 이름 시드 데이터 (최근 30일 기준 등록 건수 mock)
const MOCK_POPULARITY: Record<string, { count: number; trend: 'rising' | 'stable' | 'falling' | 'new' }> = {
  '지우': { count: 847, trend: 'rising' },
  '서연': { count: 1203, trend: 'stable' },
  '하준': { count: 2341, trend: 'rising' },
  '유나': { count: 612, trend: 'falling' },
  '민준': { count: 1876, trend: 'stable' },
  '서준': { count: 1654, trend: 'rising' },
  '아린': { count: 423, trend: 'rising' },
  '채원': { count: 734, trend: 'stable' },
  '도윤': { count: 891, trend: 'stable' },
  '시우': { count: 567, trend: 'rising' },
  '예린': { count: 489, trend: 'falling' },
  '지호': { count: 1102, trend: 'stable' },
  '수아': { count: 321, trend: 'rising' },
  '태양': { count: 198, trend: 'new' },
  '나은': { count: 876, trend: 'stable' },
  '은서': { count: 743, trend: 'falling' },
  '규민': { count: 234, trend: 'new' },
  '하은': { count: 1456, trend: 'stable' },
  '지안': { count: 678, trend: 'rising' },
  '민서': { count: 1089, trend: 'stable' },
  '온': { count: 89, trend: 'new' },
  '율': { count: 156, trend: 'rising' },
  '빛': { count: 43, trend: 'new' },
  '결': { count: 67, trend: 'new' },
  '찬': { count: 312, trend: 'stable' },
  '솔': { count: 234, trend: 'stable' },
  '도': { count: 178, trend: 'falling' },
  '현': { count: 567, trend: 'stable' },
  '란': { count: 123, trend: 'falling' },
  '희': { count: 289, trend: 'falling' },
};

function getMockPopularity(names: string[]): Record<string, PopularityData> {
  const all = Object.values(MOCK_POPULARITY).map(v => v.count).sort((a, b) => b - a);
  const result: Record<string, PopularityData> = {};
  for (const name of names) {
    const seed = MOCK_POPULARITY[name];
    // 모르는 이름은 랜덤 seed
    const count = seed?.count ?? Math.floor(Math.random() * 200 + 10);
    const trend = seed?.trend ?? 'new';
    const rank = all.indexOf(count) + 1 || all.length + 1;
    const trendPercent = trend === 'rising' ? Math.floor(Math.random() * 40 + 15)
      : trend === 'falling' ? -(Math.floor(Math.random() * 30 + 10))
      : trend === 'new' ? 100
      : Math.floor(Math.random() * 10 - 5);
    result[name] = { recentCount: count, trend, trendPercent, rank };
  }
  return result;
}

export const namingRouter = createTRPCRouter({
  generateNames: protectedProcedure
    .input(z.object({
      parent1BirthDate: z.string(),
      parent1BirthTime: z.string().optional(),
      parent2BirthDate: z.string().optional(),
      parent2BirthTime: z.string().optional(),
      babyBirthDate: z.string().optional(),
      babyBirthTime: z.string().optional(),
      gender: z.enum(['male', 'female', 'unknown']),
      hangryeolChar: z.string().optional(),
      siblingNames: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const parent1Saju = calculateSaju(input.parent1BirthDate, input.parent1BirthTime);
      const parent2Saju = input.parent2BirthDate ? calculateSaju(input.parent2BirthDate, input.parent2BirthTime) : undefined;
      const babySaju = input.babyBirthDate ? calculateSaju(input.babyBirthDate, input.babyBirthTime) : parent1Saju;

      const names = await generateNames({
        parent1Saju,
        parent2Saju,
        babyBirthDate: input.babyBirthDate,
        babyBirthTime: input.babyBirthTime,
        gender: input.gender,
        hangryeolChar: input.hangryeolChar,
        siblingNames: input.siblingNames,
      });

      const { data: request } = await ctx.supabase
        .from('naming_requests')
        .insert({
          user_id: ctx.user.id,
          parent1_saju: parent1Saju,
          parent2_saju: parent2Saju,
          baby_birth_date: input.babyBirthDate,
          baby_birth_time: input.babyBirthTime,
          gender: input.gender,
          hangryeol_char: input.hangryeolChar,
          sibling_names: input.siblingNames,
        })
        .select()
        .single();

      const { data: result } = await ctx.supabase
        .from('naming_results')
        .insert({
          request_id: request?.id,
          suggested_names: names,
        })
        .select()
        .single();

      return { names, requestId: request?.id, resultId: result?.id };
    }),

  analyzeName: protectedProcedure
    .input(z.object({
      name: z.string(),
      hanja: z.string(),
      resultId: z.string(),
      parent1BirthDate: z.string(),
      parent2BirthDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const parent1Saju = calculateSaju(input.parent1BirthDate);
      const parent2Saju = input.parent2BirthDate ? calculateSaju(input.parent2BirthDate) : undefined;

      const report = await analyzeName(input.name, input.hanja, parent1Saju, parent1Saju, parent2Saju);

      const { data } = await ctx.supabase
        .from('naming_reports')
        .insert({
          result_id: input.resultId,
          user_id: ctx.user.id,
          selected_name: input.name,
          selected_hanja: input.hanja,
          report_data: report,
          price_paid: 1000,
        })
        .select()
        .single();

      return { report, reportId: data?.id };
    }),

  reviewName: protectedProcedure
    .input(z.object({
      name: z.string(),
      hanja: z.string().optional(),
      birthDate: z.string(),
      birthTime: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { calculateSaju } = await import('@/lib/saju/saju-calculator');
      const sajuResult = calculateSaju(input.birthDate, input.birthTime);
      const review = await reviewName(input.name, input.hanja || '', sajuResult);

      await ctx.supabase.from('naming_reviews').insert({
        user_id: ctx.user.id,
        input_name: input.name,
        input_hanja: input.hanja,
        quick_result: review,
      });

      return review;
    }),

  generateTaemyeong: protectedProcedure
    .input(z.object({
      parent1BirthDate: z.string(),
      parent2BirthDate: z.string().optional(),
      gender: z.enum(['male', 'female', 'unknown']),
    }))
    .mutation(async ({ ctx, input }) => {
      const parent1Saju = calculateSaju(input.parent1BirthDate);
      const parent2Saju = input.parent2BirthDate ? calculateSaju(input.parent2BirthDate) : undefined;
      return generateTaemyeong(parent1Saju, parent2Saju, input.gender);
    }),

  generateEnglishNames: protectedProcedure
    .input(z.object({
      koreanName: z.string(),
      hanja: z.string().optional(),
      gender: z.string(),
      options: z.array(z.enum(['similar_sound', 'similar_meaning', 'same_initial', 'global_popular', 'custom'])),
      customPrompt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return generateEnglishNames(
        input.koreanName,
        input.hanja || '',
        input.gender,
        input.options,
        input.customPrompt
      );
    }),

  generateNamesPublic: publicProcedure
    .input(z.object({
      parent1BirthDate: z.string(),
      parent1BirthTime: z.string().optional(),
      parent2BirthDate: z.string().optional(),
      parent2BirthTime: z.string().optional(),
      babyBirthDate: z.string().optional(),
      babyBirthTime: z.string().optional(),
      gender: z.enum(['male', 'female', 'unknown']),
      hangryeolChar: z.string().optional(),
      siblingNames: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const parent1Saju = calculateSaju(input.parent1BirthDate, input.parent1BirthTime);
      const parent2Saju = input.parent2BirthDate ? calculateSaju(input.parent2BirthDate, input.parent2BirthTime) : undefined;

      const names = await generateNames({
        parent1Saju,
        parent2Saju,
        babyBirthDate: input.babyBirthDate,
        babyBirthTime: input.babyBirthTime,
        gender: input.gender,
        hangryeolChar: input.hangryeolChar,
        siblingNames: input.siblingNames,
      });

      return { names, resultId: 'guest' };
    }),

  getNamePopularity: publicProcedure
    .input(z.object({ names: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      // 실제 DB 쿼리 시도 (graceful fallback)
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const { data: recentRows } = await ctx.supabase
          .from('naming_reports')
          .select('selected_name, created_at')
          .in('selected_name', input.names);

        if (recentRows && recentRows.length > 0) {
          const result: Record<string, PopularityData> = {};
          for (const name of input.names) {
            const recent = recentRows.filter(r =>
              r.selected_name === name && new Date(r.created_at) >= thirtyDaysAgo
            ).length;
            const prev = recentRows.filter(r =>
              r.selected_name === name &&
              new Date(r.created_at) >= sixtyDaysAgo &&
              new Date(r.created_at) < thirtyDaysAgo
            ).length;
            const trendPercent = prev === 0 ? (recent > 0 ? 100 : 0) : Math.round(((recent - prev) / prev) * 100);
            result[name] = {
              recentCount: recent,
              trend: trendPercent >= 20 ? 'rising' : trendPercent <= -20 ? 'falling' : recent === 0 ? 'new' : 'stable',
              trendPercent,
              rank: 0,
            };
          }
          return result;
        }
      } catch (_) { /* fallback below */ }

      // Fallback: mock seed data (실제 DB 없을 때)
      return getMockPopularity(input.names);
    }),
});
