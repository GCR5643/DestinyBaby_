import { createTRPCRouter } from './server';
import { namingRouter } from './routers/naming';
import { communityRouter } from './routers/community';
import { paymentsRouter } from './routers/payments';
import { userRouter } from './routers/user';
import { cardsRouter } from './routers/cards';
import { sajuRouter } from './routers/saju';
import { birthdateRouter } from './routers/birthdate';

export const appRouter = createTRPCRouter({
  naming: namingRouter,
  cards: cardsRouter,
  community: communityRouter,
  payments: paymentsRouter,
  user: userRouter,
  saju: sajuRouter,
  birthdate: birthdateRouter,
});

export type AppRouter = typeof appRouter;
