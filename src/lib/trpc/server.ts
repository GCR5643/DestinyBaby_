import { initTRPC, TRPCError } from '@trpc/server';
import { createClient } from '@/lib/supabase/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { SKIP_AUTH, MOCK_USER } from '@/lib/auth/skip-auth';

export const createTRPCContext = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  // SKIP_AUTH: 테스트용 인증 우회 (롤백: NEXT_PUBLIC_SKIP_AUTH 환경변수 삭제)
  if (SKIP_AUTH && !ctx.user) {
    return next({ ctx: { ...ctx, user: MOCK_USER } });
  }
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.user } });
});
