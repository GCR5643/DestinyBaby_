import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/lib/trpc/server';

const MOCK_POSTS = [
  { id: '1', user_id: 'u1', category: 'naming', title: 'AI가 추천해준 이름 너무 마음에 들어요!', content: '사주 기반으로 추천받은 지우라는 이름... 할머니도 좋아하셨어요 😊', like_count: 42, comment_count: 15, view_count: 230, created_at: new Date().toISOString(), user: { nickname: '행복한엄마', avatar_url: '' } },
  { id: '2', user_id: 'u2', category: 'saju', title: '사주로 본 아이 성격이 너무 맞아요', content: '水 기운이 강한 아이인데 정말 유연하고 창의적이에요!', like_count: 38, comment_count: 22, view_count: 180, created_at: new Date().toISOString(), user: { nickname: '별빛아빠', avatar_url: '' } },
];

export const communityRouter = createTRPCRouter({
  getPosts: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const from = (input.page - 1) * input.limit;
        const to = from + input.limit - 1;

        let query = ctx.supabase
          .from('community_posts')
          .select('*, user:user_id(nickname, avatar_url)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (input.category) {
          query = query.eq('category', input.category);
        }

        const { data, count, error } = await query;

        if (error) {
          return { posts: MOCK_POSTS, total: MOCK_POSTS.length };
        }

        return { posts: data ?? [], total: count ?? 0 };
      } catch (e) {
        console.warn('[community] getPosts failed:', e);
        return { posts: MOCK_POSTS, total: MOCK_POSTS.length };
      }
    }),

  getPost: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase
          .from('community_posts')
          .select('*, user:user_id(nickname, avatar_url)')
          .eq('id', input.id)
          .single();

        if (error) {
          const mock = MOCK_POSTS.find(p => p.id === input.id);
          return mock ?? null;
        }

        // 조회수 원자적 증가 (fire and forget)
        ctx.supabase.rpc('increment_view_count', { p_post_id: input.id }).then(({ error: rpcErr }) => {
          if (rpcErr) {
            // RPC 미존재 시 폴백
            ctx.supabase
              .from('community_posts')
              .update({ view_count: (data.view_count ?? 0) + 1 })
              .eq('id', input.id)
              .then(() => {});
          }
        });

        return data;
      } catch (e) {
        console.warn('[community] getPost failed:', e);
        return MOCK_POSTS.find(p => p.id === input.id) ?? null;
      }
    }),

  createPost: protectedProcedure
    .input(z.object({
      category: z.enum(['naming', 'saju', 'pregnancy', 'parenting', 'free']),
      title: z.string().max(100).optional(),
      content: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase
          .from('community_posts')
          .insert({
            user_id: ctx.user.id,
            category: input.category,
            title: input.title,
            content: input.content,
            like_count: 0,
            comment_count: 0,
            view_count: 0,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('[community] createPost failed:', e);
        throw e;
      }
    }),

  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if like already exists
        const { data: existing } = await ctx.supabase
          .from('community_likes')
          .select('id')
          .eq('post_id', input.postId)
          .eq('user_id', ctx.user.id)
          .single();

        if (existing) {
          // Unlike
          await ctx.supabase
            .from('community_likes')
            .delete()
            .eq('post_id', input.postId)
            .eq('user_id', ctx.user.id);

          await ctx.supabase.rpc('decrement_like_count', { post_id: input.postId }).then(() => {});

          return { liked: false };
        } else {
          // Like
          await ctx.supabase
            .from('community_likes')
            .insert({ post_id: input.postId, user_id: ctx.user.id });

          await ctx.supabase.rpc('increment_like_count', { post_id: input.postId }).then(() => {});

          return { liked: true };
        }
      } catch (e) {
        console.warn('[community] toggleLike failed:', e);
        return { liked: false };
      }
    }),

  addComment: protectedProcedure
    .input(z.object({
      postId: z.string(),
      content: z.string().min(1).max(500),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase
          .from('community_comments')
          .insert({
            post_id: input.postId,
            user_id: ctx.user.id,
            content: input.content,
          })
          .select()
          .single();

        if (error) throw error;

        // increment comment count (fire and forget)
        ctx.supabase
          .from('community_posts')
          .select('comment_count')
          .eq('id', input.postId)
          .single()
          .then(({ data: post }) => {
            if (post) {
              ctx.supabase
                .from('community_posts')
                .update({ comment_count: (post.comment_count ?? 0) + 1 })
                .eq('id', input.postId)
                .then(() => {});
            }
          });

        return data;
      } catch (e) {
        console.warn('[community] addComment failed:', e);
        return {
          id: String(Date.now()),
          post_id: input.postId,
          user_id: ctx.user.id,
          content: input.content,
          created_at: new Date().toISOString(),
        };
      }
    }),

  getComments: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase
          .from('community_comments')
          .select('*, user:user_id(nickname, avatar_url)')
          .eq('post_id', input.postId)
          .order('created_at', { ascending: true });

        if (error) return [];
        return data ?? [];
      } catch (e) {
        console.warn('[community] getComments failed:', e);
        return [];
      }
    }),

  // 게시글 삭제 (작성자만)
  deletePost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('community_posts')
        .delete()
        .eq('id', input.postId)
        .eq('user_id', ctx.user.id)
        .select('id')
        .single();

      if (error || !data) throw new Error('삭제 권한이 없거나 게시글을 찾을 수 없습니다');
      return { success: true };
    }),

  // 게시글 수정 (작성자만)
  updatePost: protectedProcedure
    .input(z.object({
      postId: z.string(),
      title: z.string().max(100).optional(),
      content: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('community_posts')
        .update({
          title: input.title,
          content: input.content,
        })
        .eq('id', input.postId)
        .eq('user_id', ctx.user.id)
        .select('id')
        .single();

      if (error || !data) throw new Error('수정 권한이 없거나 게시글을 찾을 수 없습니다');
      return { success: true };
    }),
});
