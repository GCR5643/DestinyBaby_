'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Package } from 'lucide-react';
import Link from 'next/link';
import CardPullAnimation from '@/components/cards/CardPullAnimation';
import CardCollection from '@/components/cards/CardCollection';
import { trpc } from '@/lib/trpc/client';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';
import type { Card, UserCard, Grade, Element, CardSajuExplanation } from '@/types';
import { pickCardTemplate } from '@/lib/cards/card-catalog';
import { SKIP_AUTH } from '@/lib/auth/skip-auth';

function generateGuestCard(): Card {
  const grades: Grade[] = ['N', 'N', 'N', 'N', 'R', 'R', 'R', 'SR', 'SR', 'SSR'];
  const grade = grades[Math.floor(Math.random() * grades.length)];
  const template = pickCardTemplate(grade);
  return {
    id: 'guest-' + Date.now(),
    name: template.name,
    grade,
    element: template.element,
    description: template.ability,
    image_url: undefined,
  };
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CardsPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [pulledExplanation, setPulledExplanation] = useState<CardSajuExplanation | null>(null);
  const [tab, setTab] = useState<'pull' | 'collection'>('pull');
  const { user, updateCredits } = useUserStore();

  // Guest mode state
  const [isGuest, setIsGuest] = useState(false);
  const [guestPulls, setGuestPulls] = useState(0);
  const [guestPulledCards, setGuestPulledCards] = useState<Card[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // 매일 무료 뽑기 카운트다운
  const [dailyFreeSecondsLeft, setDailyFreeSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const guestCookie = cookies.find(c => c.startsWith('destiny-baby-guest='));
    const guest = guestCookie?.split('=')[1] === 'true';
    setIsGuest(guest);
    if (guest) {
      const stored = localStorage.getItem('guest-pulls-used');
      setGuestPulls(stored ? parseInt(stored) : 0);
    }
  }, []);

  // 카운트다운 타이머
  useEffect(() => {
    if (dailyFreeSecondsLeft === null || dailyFreeSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setDailyFreeSecondsLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [dailyFreeSecondsLeft]);

  const pullMutation = trpc.cards.pullCards.useMutation({
    onSuccess: (data) => {
      setPulledCards(data.cards);
      setPulledExplanation(data.explanation ?? null);
      setIsAnimating(true);
      if (data.creditsUsed > 0) {
        updateCredits(-data.creditsUsed);
      }
    },
  });

  const dailyFreePullMutation = trpc.cards.dailyFreePull.useMutation({
    onSuccess: (data) => {
      setPulledCards([data.card]);
      setPulledExplanation(data.explanation ?? null);
      setIsAnimating(true);
      // 다음 자정까지 남은 시간 계산
      const now = new Date();
      const tomorrowMidnight = new Date(now);
      tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
      tomorrowMidnight.setHours(0, 0, 0, 0);
      const secs = Math.ceil((tomorrowMidnight.getTime() - now.getTime()) / 1000);
      setDailyFreeSecondsLeft(secs);
    },
    onError: (err) => {
      if (err.message.startsWith('ALREADY_PULLED:')) {
        const secs = parseInt(err.message.split(':')[1], 10);
        setDailyFreeSecondsLeft(secs);
      }
    },
  });

  const collectionQuery = trpc.cards.getCollection.useQuery(
    { page: 1, pageSize: 30 },
    { enabled: tab === 'collection' && !isGuest }
  );

  const handleGuestPull = (count: 1 | 10) => {
    const used = parseInt(localStorage.getItem('guest-pulls-used') || '0');
    const free = Math.max(0, 3 - used);

    if (count === 1 && free > 0) {
      const mockCard = generateGuestCard();
      setGuestPulledCards([mockCard]);
      setIsAnimating(true);
      const newUsed = used + 1;
      localStorage.setItem('guest-pulls-used', String(newUsed));
      setGuestPulls(newUsed);
    } else {
      setShowLoginPrompt(true);
    }
  };

  const handlePull = (count: 1 | 10) => {
    if (isGuest) {
      handleGuestPull(count);
      return;
    }
    pullMutation.mutate({ count });
  };

  const handleDailyFreePull = () => {
    if (!user && !SKIP_AUTH) {
      router.push('/login?redirect=/cards');
      return;
    }
    dailyFreePullMutation.mutate();
  };

  const toggleFavoriteMutation = trpc.cards.toggleFavorite.useMutation({
    onSuccess: () => collectionQuery.refetch(),
  });

  // Derive free pulls remaining from user store (optimistic; server is source of truth)
  const freePullsRemaining = isGuest
    ? Math.max(0, 3 - guestPulls)
    : user
    ? Math.max(0, 3 - (user.total_pulls ?? 0))
    : 3;

  const collectionUserCards: UserCard[] = (collectionQuery.data?.cards ?? []) as UserCard[];

  const animationCards = isGuest ? guestPulledCards : pulledCards;

  // 오늘 무료 뽑기를 이미 사용했는지 여부
  const dailyUsed = dailyFreeSecondsLeft !== null && dailyFreeSecondsLeft > 0;

  return (
    <div className="min-h-screen pb-24 bg-gradient-card">
      {/* Animation */}
      {isAnimating && (
        <CardPullAnimation
          cards={animationCards}
          explanation={isGuest ? null : pulledExplanation}
          onComplete={() => { setIsAnimating(false); setPulledExplanation(null); if (!isGuest) setTab('collection'); }}
          onSkip={() => { setIsAnimating(false); setPulledExplanation(null); if (!isGuest) setTab('collection'); }}
        />
      )}

      {/* Header */}
      <div className="pt-12 pb-6 px-4 md:px-8 text-center text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">운명 카드 뽑기</h1>
        <p className="text-sm text-white/60">사주로 결정되는 나만의 운명 카드</p>
        {user && !isGuest && (
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-sm text-gold-400 font-semibold">{user.credits} 크레딧</span>
            {freePullsRemaining > 0 && (
              <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
                무료 뽑기 {freePullsRemaining}회 남음
              </span>
            )}
          </div>
        )}
      </div>

      {/* Guest banner */}
      {isGuest && (
        <div className="mx-4 md:mx-auto md:max-w-2xl lg:max-w-3xl mb-4 bg-blue-500/20 border border-blue-400/40 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-lg flex-shrink-0">🔐</span>
          <div className="flex-1">
            <p className="text-blue-100 text-sm font-medium">로그인하면 카드가 저장됩니다</p>
            <p className="text-blue-200/70 text-xs mt-0.5">게스트 무료 뽑기 {Math.max(0, 3 - guestPulls)}회 남음</p>
          </div>
          <button
            onClick={() => router.push('/login?redirect=/cards')}
            className="flex-shrink-0 bg-white text-primary-600 px-3 py-1.5 rounded-full text-xs font-bold"
          >
            로그인
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex mx-4 md:mx-auto md:max-w-2xl lg:max-w-3xl mb-6 bg-white/10 rounded-2xl p-1">
        {[{ value: 'pull', label: '카드 뽑기' }, { value: 'collection', label: '내 컬렉션' }].map(t => (
          <button key={t.value}
            onClick={() => setTab(t.value as 'pull' | 'collection')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.value ? 'bg-white text-primary-700' : 'text-white/70'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 md:px-0 md:max-w-2xl lg:max-w-3xl md:mx-auto">
        {tab === 'pull' ? (
          <div className="space-y-4">
            {/* Pack showcase */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center mb-8">
              <div className="w-40 h-56 bg-gradient-to-br from-primary-600 to-indigo-800 rounded-2xl shadow-2xl border border-primary-400/30 flex flex-col items-center justify-center gap-3">
                <div className="text-5xl">✦</div>
                <p className="text-white/70 text-xs">운명의 팩</p>
              </div>
            </motion.div>

            {/* 오늘의 무료 뽑기 버튼 */}
            {!isGuest && user ? (
              dailyUsed ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <p className="text-white/40 text-sm font-semibold">내일 다시 뽑기</p>
                  <p className="text-white/30 text-xs mt-1">
                    {dailyFreeSecondsLeft !== null ? formatCountdown(dailyFreeSecondsLeft) : ''} 남음
                  </p>
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  animate={{ boxShadow: ['0 0 0px #a855f7', '0 0 20px #a855f7', '0 0 0px #a855f7'] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  onClick={handleDailyFreePull}
                  disabled={dailyFreePullMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  🎁 오늘의 무료 뽑기
                </motion.button>
              )
            ) : !isGuest ? (
              <p className="text-center text-white/50 text-sm">로그인하면 매일 무료 1회!</p>
            ) : null}

            {dailyFreePullMutation.isError && !dailyFreePullMutation.error?.message.startsWith('ALREADY_PULLED:') && (
              <p className="text-red-400 text-sm text-center">{dailyFreePullMutation.error?.message}</p>
            )}

            {/* Pull buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handlePull(1)}
                disabled={pullMutation.isPending}
                className="bg-white/10 border border-white/20 text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5 text-gold-400" />
                <span>1회 뽑기</span>
                <span className="text-xs text-white/50">
                  {freePullsRemaining > 0 ? '무료' : '1 크레딧'}
                </span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handlePull(10)}
                disabled={pullMutation.isPending}
                className="bg-gradient-to-r from-gold-400 to-gold-500 text-gray-900 py-4 rounded-2xl font-bold flex flex-col items-center gap-1 disabled:opacity-50"
              >
                <Package className="w-5 h-5" />
                <span>10회 뽑기</span>
                <span className="text-xs opacity-70">9 크레딧 (10% 할인)</span>
              </motion.button>
            </div>

            {pullMutation.isError && (
              <p className="text-red-400 text-sm text-center">{pullMutation.error?.message}</p>
            )}

            {/* Probability info */}
            <div className="bg-white/5 rounded-2xl p-4">
              <h3 className="text-white/80 text-sm font-semibold mb-2">뽑기 확률</h3>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { grade: 'N', prob: '40%', cls: 'text-gray-400' },
                  { grade: 'R', prob: '30%', cls: 'text-blue-500' },
                  { grade: 'SR', prob: '15%', cls: 'text-violet-500' },
                  { grade: 'SSR', prob: '8%', cls: 'text-amber-500' },
                  { grade: 'UR', prob: '4%', cls: 'text-red-500' },
                  { grade: 'SSS', prob: '3%', cls: 'text-pink-500' },
                ].map(g => (
                  <div key={g.grade} className="text-center">
                    <div className={`text-xs font-bold ${g.cls}`}>{g.grade}</div>
                    <div className="text-white/50 text-xs">{g.prob}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <Link href="/cards/probability" className="text-white/40 text-xs hover:text-white/70 transition-colors">
                  확률 안내 &gt;
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-2xl p-4">
            {isGuest ? (
              <div className="text-center py-12 text-white/50 text-sm">
                <p className="mb-3">카드를 저장하려면 로그인이 필요해요</p>
                <button onClick={() => router.push('/login?redirect=/cards')} className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold">로그인하기</button>
              </div>
            ) : collectionQuery.isLoading ? (
              <div className="text-center py-12 text-white/50 text-sm">불러오는 중...</div>
            ) : (
              <CardCollection
                userCards={collectionUserCards}
                onFavorite={(cardId) => {
                  const uc = collectionUserCards.find(c => c.card?.id === cardId);
                  if (uc) toggleFavoriteMutation.mutate({ userCardId: uc.id, isFavorite: !uc.is_favorite });
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 text-center max-w-xs w-full">
            <div className="text-4xl mb-3">🔐</div>
            <h3 className="font-black text-gray-900 mb-2">로그인이 필요해요</h3>
            <p className="text-sm text-gray-500 mb-5">무료 뽑기 3회 이후엔<br/>로그인이 필요합니다</p>
            <button onClick={() => router.push('/login?redirect=/cards')} className="w-full bg-primary-500 text-white py-3 rounded-2xl font-bold mb-2">로그인하기</button>
            <button onClick={() => setShowLoginPrompt(false)} className="w-full text-gray-400 text-sm">나중에</button>
          </div>
        </div>
      )}
    </div>
  );
}
