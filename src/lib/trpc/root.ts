import { createTRPCRouter } from './server';
import { namingRouter } from './routers/naming';
import { communityRouter } from './routers/community';
import { paymentsRouter } from './routers/payments';
import { userRouter } from './routers/user';
import { cardsRouter } from './routers/cards';
import { sajuRouter } from './routers/saju';
import { birthdateRouter } from './routers/birthdate';
import { fragmentsRouter } from './routers/fragments';
import { checkinRouter } from './routers/checkin';
import { dailyFortuneRouter } from './routers/daily-fortune';
import { votingRouter } from './routers/voting';

export const appRouter = createTRPCRouter({
  naming: namingRouter,
  cards: cardsRouter,
  community: communityRouter,
  payments: paymentsRouter,
  user: userRouter,
  saju: sajuRouter,
  birthdate: birthdateRouter,
  fragments: fragmentsRouter,
  checkin: checkinRouter,
  dailyFortune: dailyFortuneRouter,
  voting: votingRouter,
});

export type AppRouter = typeof appRouter;
