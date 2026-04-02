import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/lib/trpc/server';

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

const candidateSchema = z.object({
  name: z.string(),
  hanja: z.string().optional().default(''),
  description: z.string().optional().default(''),
  sajuScore: z.number().optional(),
  element: z.string().optional(),
  isCustom: z.boolean().optional().default(false),
});

export const votingRouter = createTRPCRouter({
  // 투표 세션 생성
  createSession: publicProcedure
    .input(z.object({
      title: z.string().optional().default('우리 아이 이름 투표'),
      surname: z.string().optional().default(''),
      candidates: z.array(candidateSchema).min(1).max(20),
    }))
    .mutation(async ({ ctx, input }) => {
      const shareCode = generateShareCode();
      const userId = ctx.user?.id ?? null;

      const { data, error } = await ctx.supabase
        .from('name_vote_sessions')
        .insert({
          share_code: shareCode,
          creator_id: userId,
          title: input.title,
          surname: input.surname,
          candidates: input.candidates,
        })
        .select('id')
        .single();

      if (error) throw new Error(`투표 세션 생성 실패: ${error.message}`);
      return { sessionId: data.id, shareCode };
    }),

  // 투표 세션 조회 (공개)
  getSession: publicProcedure
    .input(z.object({ shareCode: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: session } = await ctx.supabase
        .from('name_vote_sessions')
        .select('*')
        .eq('share_code', input.shareCode)
        .single();

      if (!session) return null;

      // 제출 + 선택 조회
      const { data: submissions } = await ctx.supabase
        .from('vote_submissions')
        .select('*, vote_selections(*)')
        .eq('session_id', session.id)
        .order('created_at', { ascending: false });

      // 이름별 투표수 집계
      const voteCounts: Record<string, number> = {};
      const voters: { name: string; isAnonymous: boolean; selectedNames: string[]; blessing: string | null; createdAt: string }[] = [];

      for (const sub of (submissions ?? [])) {
        const selections = (sub.vote_selections ?? []) as { voted_name: string }[];
        const selectedNames = selections.map((s: { voted_name: string }) => s.voted_name);

        for (const name of selectedNames) {
          voteCounts[name] = (voteCounts[name] || 0) + 1;
        }

        voters.push({
          name: sub.is_anonymous ? '익명' : (sub.voter_name || '익명'),
          isAnonymous: sub.is_anonymous,
          selectedNames,
          blessing: sub.blessing_message,
          createdAt: sub.created_at,
        });
      }

      const totalVotes = voters.length;

      return {
        sessionId: session.id,
        title: session.title || '우리 아이 이름 투표',
        surname: session.surname || '',
        candidates: session.candidates as {
          name: string; hanja?: string; description?: string;
          sajuScore?: number; element?: string; isCustom?: boolean;
        }[],
        voteCounts,
        voters,
        totalVotes,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
        isClosed: session.expires_at ? new Date(session.expires_at) < new Date() : false,
      };
    }),

  // 투표 제출 (복수 선택 + 덕담 + 익명, 핑거프린트 기반 중복 방지)
  submitVote: publicProcedure
    .input(z.object({
      shareCode: z.string(),
      selectedNames: z.array(z.string()).min(1),
      voterName: z.string().optional(),
      isAnonymous: z.boolean().optional().default(false),
      blessingMessage: z.string().max(500).optional(),
      fingerprint: z.string().max(64).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // 세션 조회
      const { data: session } = await ctx.supabase
        .from('name_vote_sessions')
        .select('id, expires_at')
        .eq('share_code', input.shareCode)
        .single();

      if (!session) throw new Error('투표 세션을 찾을 수 없습니다');

      // 핑거프린트 기반 중복 투표 방지
      if (input.fingerprint) {
        const { data: existing } = await ctx.supabase
          .from('vote_submissions')
          .select('id')
          .eq('session_id', session.id)
          .eq('voter_fingerprint', input.fingerprint)
          .limit(1);

        if (existing && existing.length > 0) {
          throw new Error('이미 이 세션에 투표하셨습니다');
        }
      }

      // 만료 체크
      const expiresAt = (session as { id: string; expires_at?: string }).expires_at;
      if (expiresAt && new Date(expiresAt) < new Date()) {
        throw new Error('투표 기간이 종료된 세션입니다');
      }

      // 제출 생성
      const { data: submission, error: subError } = await ctx.supabase
        .from('vote_submissions')
        .insert({
          session_id: session.id,
          voter_name: input.isAnonymous ? null : (input.voterName || null),
          is_anonymous: input.isAnonymous,
          blessing_message: input.blessingMessage || null,
          voter_fingerprint: input.fingerprint || null,
        })
        .select('id')
        .single();

      if (subError) throw new Error(`투표 제출 실패: ${subError.message}`);

      // 개별 선택 삽입
      const selections = input.selectedNames.map(name => ({
        submission_id: submission.id,
        session_id: session.id,
        voted_name: name,
      }));

      const { error: selError } = await ctx.supabase
        .from('vote_selections')
        .insert(selections);

      if (selError) throw new Error(`투표 선택 저장 실패: ${selError.message}`);

      // 기존 name_votes에도 호환용 삽입 (레거시)
      for (const name of input.selectedNames) {
        await ctx.supabase.from('name_votes').insert({
          session_id: session.id,
          voter_name: input.isAnonymous ? '익명' : (input.voterName || null),
          voted_name: name,
        }).then(() => {});
      }

      return { success: true, submissionId: submission.id };
    }),

  // 투표 결과 조회 (덕담 포함)
  getResults: publicProcedure
    .input(z.object({ shareCode: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: session } = await ctx.supabase
        .from('name_vote_sessions')
        .select('*')
        .eq('share_code', input.shareCode)
        .single();

      if (!session) return null;

      const { data: submissions } = await ctx.supabase
        .from('vote_submissions')
        .select('*, vote_selections(*)')
        .eq('session_id', session.id)
        .order('created_at', { ascending: false });

      // 이름별 투표수 + 투표자 목록
      const nameResults: Record<string, { count: number; voters: string[] }> = {};
      const blessings: { name: string; message: string; createdAt: string }[] = [];

      for (const sub of (submissions ?? [])) {
        const voterDisplay = sub.is_anonymous ? '익명' : (sub.voter_name || '익명');
        const selections = (sub.vote_selections ?? []) as { voted_name: string }[];

        for (const sel of selections) {
          if (!nameResults[sel.voted_name]) {
            nameResults[sel.voted_name] = { count: 0, voters: [] };
          }
          nameResults[sel.voted_name].count++;
          nameResults[sel.voted_name].voters.push(voterDisplay);
        }

        if (sub.blessing_message) {
          blessings.push({
            name: voterDisplay,
            message: sub.blessing_message,
            createdAt: sub.created_at,
          });
        }
      }

      // 랭킹 정렬
      const candidates = session.candidates as { name: string; hanja?: string; description?: string; sajuScore?: number; element?: string }[];
      const ranking = candidates
        .map(c => ({
          ...c,
          votes: nameResults[c.name]?.count ?? 0,
          voters: nameResults[c.name]?.voters ?? [],
        }))
        .sort((a, b) => b.votes - a.votes);

      const isClosed = session.expires_at ? new Date(session.expires_at) < new Date() : false;

      return {
        sessionId: session.id,
        title: session.title || '우리 아이 이름 투표',
        surname: session.surname || '',
        ranking,
        blessings,
        totalVoters: (submissions ?? []).length,
        totalVotes: Object.values(nameResults).reduce((sum, r) => sum + r.count, 0),
        createdAt: session.created_at,
        isClosed,
      };
    }),

  // 내 투표 세션 목록 (로그인 유저)
  getMySessions: protectedProcedure
    .query(async ({ ctx }) => {
      const { data: sessions } = await ctx.supabase
        .from('name_vote_sessions')
        .select('id, share_code, title, surname, candidates, created_at, expires_at')
        .eq('creator_id', ctx.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!sessions || sessions.length === 0) return [];

      // 각 세션의 투표수 조회
      const result = [];
      for (const session of sessions) {
        const { count } = await ctx.supabase
          .from('vote_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id);

        const candidates = session.candidates as { name: string }[];
        result.push({
          id: session.id,
          shareCode: session.share_code,
          title: session.title || '우리 아이 이름 투표',
          surname: session.surname || '',
          candidateCount: candidates.length,
          candidateNames: candidates.slice(0, 3).map(c => c.name),
          totalVoters: count ?? 0,
          createdAt: session.created_at,
          expiresAt: session.expires_at,
        });
      }

      return result;
    }),

  // 투표 마감하기 (생성자만 가능)
  closeSession: protectedProcedure
    .input(z.object({ shareCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('name_vote_sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('share_code', input.shareCode)
        .eq('creator_id', ctx.user.id)
        .select('id')
        .single();

      if (error || !data) throw new Error('투표 마감 권한이 없거나 세션을 찾을 수 없습니다');
      return { success: true };
    }),
});
