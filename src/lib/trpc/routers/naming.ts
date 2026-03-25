import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/lib/trpc/server';
import { generateNames } from '@/lib/naming/name-generator';
import { analyzeName } from '@/lib/naming/name-analyzer';
import { reviewName } from '@/lib/naming/name-reviewer';
import { generateTaemyeong } from '@/lib/naming/taemyeong-generator';
import { generateEnglishNames } from '@/lib/naming/english-name-generator';
import { calculateSaju } from '@/lib/saju/saju-calculator';
import { analyzeParentChildCompatibility } from '@/lib/saju/compatibility';
import { fetchKosisNameStats, getNationalTrendPercent, MALE_TOP_200, type KosisNameStat } from '@/lib/naming/kosis-popularity';
import { searchFamousNames } from '@/lib/naming/famous-names';
import type { SuggestedName } from '@/types';

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

interface PopularityData {
  recentCount: number;      // 가중 합산 표시용 (국가 기준)
  nationalCount: number;    // 국가 통계 건수
  serviceCount30d: number;  // 서비스 내 30일 선택 수
  compositeScore: number;   // 0~100 정규화 유행지수
  trend: 'rising' | 'stable' | 'falling' | 'new';
  trendPercent: number;
  rank: number;
  source: 'kosis+service' | 'kosis' | 'mock';
}

/**
 * 가중 유행지수 계산
 * @param nationalCount 통계청 연간 등록 건수
 * @param serviceCount  서비스 내 최근 30일 최종선택 수
 * @param totalServiceSelections 서비스 전체 최종선택 수 (cold start 보정용)
 * @param maxNational 전체 이름 중 최대 국가 등록 수
 * @param maxService  전체 이름 중 최대 서비스 선택 수
 */
function computeCompositeScore(
  nationalCount: number,
  serviceCount: number,
  totalServiceSelections: number,
  maxNational: number,
  maxService: number,
): { score: number; wNational: number; wService: number } {
  // Cold start 보정: 서비스 데이터 희박할수록 국가 통계 비중 높임
  const wService = totalServiceSelections < 100 ? 0.15
    : totalServiceSelections < 1000 ? 0.30
    : 0.40;
  const wNational = 1 - wService;

  const nNorm = maxNational > 0 ? nationalCount / maxNational : 0;
  const sNorm = maxService > 0 ? serviceCount / maxService : 0;

  const score = Math.round((nNorm * wNational + sNorm * wService) * 100);
  return { score, wNational, wService };
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
      surname: z.string().default(''),
      surnameHanja: z.string().optional(),
      hangryeolChar: z.string().optional(),
      siblingNames: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const parent1Saju = calculateSaju(input.parent1BirthDate, input.parent1BirthTime);
      const parent2Saju = input.parent2BirthDate ? calculateSaju(input.parent2BirthDate, input.parent2BirthTime) : undefined;
      const babySaju = input.babyBirthDate ? calculateSaju(input.babyBirthDate, input.babyBirthTime) : undefined;

      const names = await generateNames({
        parent1Saju,
        parent2Saju,
        babySaju,
        babyBirthDate: input.babyBirthDate,
        babyBirthTime: input.babyBirthTime,
        gender: input.gender,
        surname: input.surname,
        surnameHanja: input.surnameHanja,
        hangryeolChar: input.hangryeolChar,
        siblingNames: input.siblingNames,
      });

      const { data: request, error: requestError } = await ctx.supabase
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

      if (requestError) throw new Error(`naming_requests insert 실패: ${requestError.message}`);

      const { data: result, error: resultError } = await ctx.supabase
        .from('naming_results')
        .insert({
          request_id: request?.id,
          suggested_names: names,
        })
        .select()
        .single();

      if (resultError) throw new Error(`naming_results insert 실패: ${resultError.message}`);

      return { names, requestId: request?.id, resultId: result?.id };
    }),

  analyzeName: protectedProcedure
    .input(z.object({
      name: z.string(),
      hanja: z.string(),
      resultId: z.string(),
      parent1BirthDate: z.string(),
      parent2BirthDate: z.string().optional(),
      babyBirthDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const parent1Saju = calculateSaju(input.parent1BirthDate);
      const parent2Saju = input.parent2BirthDate ? calculateSaju(input.parent2BirthDate) : undefined;
      const babySaju = input.babyBirthDate ? calculateSaju(input.babyBirthDate) : parent1Saju;

      const report = await analyzeName(input.name, input.hanja, babySaju, parent1Saju, parent2Saju);

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
      surname: z.string().default(''),
      surnameHanja: z.string().optional(),
      hangryeolChar: z.string().optional(),
      siblingNames: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const parent1Saju = calculateSaju(input.parent1BirthDate, input.parent1BirthTime);
      const parent2Saju = input.parent2BirthDate ? calculateSaju(input.parent2BirthDate, input.parent2BirthTime) : undefined;
      const babySaju = input.babyBirthDate ? calculateSaju(input.babyBirthDate, input.babyBirthTime) : undefined;

      const names = await generateNames({
        parent1Saju,
        parent2Saju,
        babySaju,
        babyBirthDate: input.babyBirthDate,
        babyBirthTime: input.babyBirthTime,
        gender: input.gender,
        surname: input.surname,
        surnameHanja: input.surnameHanja,
        hangryeolChar: input.hangryeolChar,
        siblingNames: input.siblingNames,
      });

      return { names, resultId: 'guest' };
    }),

  evaluateName: publicProcedure
    .input(z.object({
      name: z.string(),
      hanja: z.string().optional(),
      birthDate: z.string(),
      birthTime: z.string().optional(),
      gender: z.enum(['male', 'female', 'unknown']).optional(),
      parent1BirthDate: z.string().optional(),
      parent1BirthTime: z.string().optional(),
      parent2BirthDate: z.string().optional(),
      parent2BirthTime: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const babySaju = calculateSaju(input.birthDate, input.birthTime);
      const parent1Saju = input.parent1BirthDate
        ? calculateSaju(input.parent1BirthDate, input.parent1BirthTime)
        : babySaju;
      const parent2Saju = input.parent2BirthDate
        ? calculateSaju(input.parent2BirthDate, input.parent2BirthTime)
        : undefined;

      const report = await analyzeName(
        input.name,
        input.hanja || '',
        babySaju,
        parent1Saju,
        parent2Saju,
      );

      // 부모 사주가 입력된 경우 부모-자녀 궁합 분석 추가
      let parentCompatibilityDetails;
      if (input.parent1BirthDate) {
        const parent1Compat = analyzeParentChildCompatibility(
          parent1Saju,
          babySaju,
          'mother',
        );
        const parent2Compat = input.parent2BirthDate && parent2Saju
          ? analyzeParentChildCompatibility(parent2Saju, babySaju, 'father')
          : undefined;

        parentCompatibilityDetails = {
          parent1: parent1Compat,
          parent2: parent2Compat,
        };
      }

      const userId = ctx.user?.id ?? null;
      if (!userId) {
        return {
          report,
          reportId: undefined,
          parentCompatibility: parentCompatibilityDetails,
          error: '로그인이 필요합니다.',
        };
      }

      const { data } = await ctx.supabase
        .from('naming_reports')
        .insert({
          user_id: userId,
          selected_name: input.name,
          selected_hanja: input.hanja || '',
          report_data: report,
          price_paid: 0,
        })
        .select()
        .single();

      return {
        report,
        reportId: data?.id as string | undefined,
        parentCompatibility: parentCompatibilityDetails,
      };
    }),

  analyzeParentChildCompatibility: publicProcedure
    .input(z.object({
      parentBirthDate: z.string(),
      parentBirthTime: z.string().optional(),
      childBirthDate: z.string(),
      childBirthTime: z.string().optional(),
      parentRole: z.enum(['father', 'mother']),
    }))
    .mutation(async ({ input }) => {
      const parentSaju = calculateSaju(input.parentBirthDate, input.parentBirthTime);
      const childSaju = calculateSaju(input.childBirthDate, input.childBirthTime);

      return analyzeParentChildCompatibility(parentSaju, childSaju, input.parentRole);
    }),

  saveResult: protectedProcedure
    .input(z.object({ resultId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('naming_results')
        .update({ user_id: ctx.user.id })
        .eq('id', input.resultId)
        .is('user_id', null);
      if (error) {
        return { saved: false, reason: 'error' as const };
      }
      return { saved: true, reason: null };
    }),

  getResult: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from('naming_results')
        .select('*')
        .eq('id', input.id)
        .single();
      return data as { id: string; suggested_names: import('@/types').SuggestedName[]; request_id: string; created_at: string } | null;
    }),

  getReport: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from('naming_reports')
        .select('id, selected_name, selected_hanja, report_data, created_at')
        .eq('id', input.id)
        .single();
      if (!data) return null;
      return {
        id: data.id as string,
        selectedName: data.selected_name as string,
        selectedHanja: data.selected_hanja as string,
        reportData: data.report_data as import('@/types').NamingReport,
        createdAt: data.created_at as string,
      };
    }),

  getNamePopularity: publicProcedure
    .input(z.object({ names: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      // 1. 통계청 KOSIS 데이터 로드
      const kosisStats: KosisNameStat[] = await fetchKosisNameStats().catch(() => MALE_TOP_200.slice(0, 50).map(n => ({ name: n.name, count: n.count, rank: n.rank, year: 2023 })));
      const maxNational = Math.max(...kosisStats.map((s: KosisNameStat) => s.count), 1);
      const kosisMap = new Map(kosisStats.map((s: KosisNameStat) => [s.name, s]));

      // 2. 서비스 DB 30일 선택 수 조회
      const serviceMap = new Map<string, { recent: number; prev: number }>();
      let totalServiceSelections = 0;

      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const { data: rows } = await ctx.supabase
          .from('naming_reports')
          .select('selected_name, created_at')
          .gte('created_at', sixtyDaysAgo.toISOString());

        if (rows) {
          totalServiceSelections = rows.filter(r =>
            new Date(r.created_at) >= thirtyDaysAgo
          ).length;

          for (const name of input.names) {
            const recent = rows.filter(r =>
              r.selected_name === name && new Date(r.created_at) >= thirtyDaysAgo
            ).length;
            const prev = rows.filter(r =>
              r.selected_name === name &&
              new Date(r.created_at) >= sixtyDaysAgo &&
              new Date(r.created_at) < thirtyDaysAgo
            ).length;
            serviceMap.set(name, { recent, prev });
          }
        }
      } catch (e) {
        console.warn('[naming] getNamePopularity service DB query failed:', e);
        // DB 없으면 serviceMap 비워둠
      }

      const maxService = Math.max(...Array.from(serviceMap.values()).map(v => v.recent), 1);

      // 3. 각 이름별 가중 점수 계산
      const result: Record<string, PopularityData> = {};

      for (const name of input.names) {
        const kosisStat = kosisMap.get(name);
        const nationalCount = kosisStat?.count ?? 0;
        const nationalRank = kosisStat?.rank ?? 999;
        const svc = serviceMap.get(name) ?? { recent: 0, prev: 0 };

        const { score } = computeCompositeScore(
          nationalCount, svc.recent, totalServiceSelections, maxNational, maxService
        );

        // 트렌드: 서비스 데이터 우선, 없으면 KOSIS 전년 대비
        let trendPercent: number;
        let trend: PopularityData['trend'];

        if (svc.recent > 0 || svc.prev > 0) {
          trendPercent = svc.prev === 0
            ? (svc.recent > 0 ? 100 : 0)
            : Math.round(((svc.recent - svc.prev) / svc.prev) * 100);
        } else {
          trendPercent = getNationalTrendPercent(name);
        }

        if (nationalCount === 0 && svc.recent === 0) {
          trend = 'new';
        } else if (trendPercent >= 20) {
          trend = 'rising';
        } else if (trendPercent <= -20) {
          trend = 'falling';
        } else {
          trend = 'stable';
        }

        // recentCount: 국가 통계 월 환산 (연간 / 12)
        const recentCount = nationalCount > 0
          ? Math.round(nationalCount / 12)
          : svc.recent > 0 ? svc.recent * 100 : 0; // 서비스만 있으면 추정치

        result[name] = {
          recentCount,
          nationalCount,
          serviceCount30d: svc.recent,
          compositeScore: score,
          trend,
          trendPercent,
          rank: nationalRank,
          source: nationalCount > 0
            ? (svc.recent > 0 ? 'kosis+service' : 'kosis')
            : 'mock',
        };
      }

      return result;
    }),

  // ── 투표 세션 생성 (공유하기 클릭 시) ──────────────────────────────────
  createVoteSession: publicProcedure
    .input(z.object({
      candidates: z.array(z.object({
        name: z.string(),
        hanja: z.string().optional(),
        reasonShort: z.string().optional(),
        sajuScore: z.number().optional(),
        element: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const shareCode = generateShareCode();
      const userId = ctx.user?.id ?? null;

      const { data, error } = await ctx.supabase
        .from('name_vote_sessions')
        .insert({
          share_code: shareCode,
          creator_id: userId,
          candidates: input.candidates,
        })
        .select('id, share_code')
        .single();

      if (error) throw new Error('투표 세션 생성 실패');
      return { sessionId: data.id as string, shareCode: data.share_code as string };
    }),

  // ── 투표 세션 조회 (투표 페이지 진입 시) ──────────────────────────────
  getVoteSession: publicProcedure
    .input(z.object({ shareCode: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: session } = await ctx.supabase
        .from('name_vote_sessions')
        .select('*')
        .eq('share_code', input.shareCode)
        .single();

      if (!session) return null;

      const { data: votes } = await ctx.supabase
        .from('name_votes')
        .select('voted_name, voter_name, created_at')
        .eq('session_id', session.id);

      const voteCounts: Record<string, number> = {};
      const voters: Array<{ name: string; votedFor: string; at: string }> = [];
      for (const v of votes ?? []) {
        voteCounts[v.voted_name] = (voteCounts[v.voted_name] ?? 0) + 1;
        voters.push({ name: v.voter_name ?? '익명', votedFor: v.voted_name, at: v.created_at });
      }

      return {
        sessionId: session.id as string,
        candidates: session.candidates as SuggestedName[],
        voteCounts,
        voters,
        totalVotes: votes?.length ?? 0,
        createdAt: session.created_at as string,
      };
    }),

  // ── 투표하기 ──────────────────────────────────────────────────────────
  vote: publicProcedure
    .input(z.object({
      shareCode: z.string(),
      votedName: z.string(),
      voterName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data: session } = await ctx.supabase
        .from('name_vote_sessions')
        .select('id')
        .eq('share_code', input.shareCode)
        .single();

      if (!session) throw new Error('투표 세션을 찾을 수 없습니다');

      const { error } = await ctx.supabase
        .from('name_votes')
        .insert({
          session_id: session.id,
          voted_name: input.votedName,
          voter_name: input.voterName ?? null,
        });

      if (error) throw new Error('투표 실패');
      return { success: true };
    }),

  // ── 이름 유명인/매체 검색 ──────────────────────────────────────────────
  getFamousNames: publicProcedure
    .input(z.object({ givenName: z.string().min(1).max(10) }))
    .query(async ({ input }) => {
      return searchFamousNames(input.givenName);
    }),
});
