import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';
import { appRouter } from '@/lib/trpc/root';
import { createTRPCContext } from '@/lib/trpc/server';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError: ({ path, error }) => {
      console.error(`tRPC error on ${path ?? '<no-path>'}:`, error);
    },
  });

export { handler as GET, handler as POST };
