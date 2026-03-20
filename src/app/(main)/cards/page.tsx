'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Package } from 'lucide-react';
import CardPullAnimation from '@/components/cards/CardPullAnimation';
import CardCollection from '@/components/cards/CardCollection';
import { trpc } from '@/lib/trpc/client';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';
import type { Card, UserCard, Grade, Element } from '@/types';

function generateGuestCard(): Card {
  const grades: Grade[] = ['B', 'B', 'B', 'B', 'A', 'A', 'A', 'S', 'S', 'SS'];
  const grade = grades[Math.floor(Math.random() * grades.length)];
  const elements: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  const element = elements[Math.floor(Math.random() * elements.length)];
  return {
    id: 'guest-' + Date.now(),
    name: ['봄의 기운', '달빛 수호', '황금 인연', '바람의 노래', '불꽃 수호'][Math.floor(Math.random() * 5)],
    grade,
    element,
    description: '운명이 깃든 카드',
    image_url: undefined,
  };
}

export default function CardsPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [tab, setTab] = useState<'pull' | 'collection'>('pull');
  const { user, updateCredits } = useUserStore();

  // Guest mode state
  const [isGuest, setIsGuest] = useState(false);
  const [guestPulls, setGuestPulls] = useState(0);
  const [guestPulledCards, setGuestPulledCards] = useState<Card[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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

  const pullMutation = trpc.cards.pullCards.useMutation({
    onSuccess: (data) => {
      setPulledCards(data.cards);
      setIsAnimating(true);
      if (data.creditsUsed > 0) {
        updateCredits(-data.creditsUsed);
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

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #2D1B69 100%)' }}>
      {/* Animation */}
      {isAnimating && (
        <CardPullAnimation
          cards={animationCards}
          onComplete={() => { setIsAnimating(false); if (!isGuest) setTab('collection'); }}
          onSkip={() => { setIsAnimating(false); if (!isGuest) setTab('collection'); }}
        />
      )}

      {/* Header */}
      <div className="pt-12 pb-6 px-4 text-center text-white">
        <h1 className="text-2xl font-bold mb-1">운명 카드 뽑기</h1>
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
        <div className="mx-4 mb-4 bg-amber-500/20 border border-amber-500/30 rounded-2xl p-3 text-center">
          <p className="text-amber-200 text-xs">
            🎁 게스트는 무료 {Math.max(0, 3 - guestPulls)}회 뽑기 가능 ·{' '}
            <button onClick={() => router.push('/login')} className="underline ml-1">로그인하면 카드가 저장돼요</button>
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex mx-4 mb-6 bg-white/10 rounded-2xl p-1">
        {[{ value: 'pull', label: '카드 뽑기' }, { value: 'collection', label: '내 컬렉션' }].map(t => (
          <button key={t.value}
            onClick={() => setTab(t.value as 'pull' | 'collection')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.value ? 'bg-white text-primary-700' : 'text-white/70'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4">
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
              <div className="grid grid-cols-5 gap-2">
                {[
                  { grade: 'B', prob: '40%', color: '#95a5a6' },
                  { grade: 'A', prob: '30%', color: '#F9CA24' },
                  { grade: 'S', prob: '18%', color: '#a29bfe' },
                  { grade: 'SS', prob: '9%', color: '#fd79a8' },
                  { grade: 'SSS', prob: '3%', color: '#e17055' },
                ].map(g => (
                  <div key={g.grade} className="text-center">
                    <div className="text-xs font-bold" style={{ color: g.color }}>{g.grade}</div>
                    <div className="text-white/50 text-xs">{g.prob}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-2xl p-4">
            {isGuest ? (
              <div className="text-center py-12 text-white/50 text-sm">
                <p className="mb-3">카드를 저장하려면 로그인이 필요해요</p>
                <button onClick={() => router.push('/login')} className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold">로그인하기</button>
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
            <button onClick={() => router.push('/login')} className="w-full bg-primary-500 text-white py-3 rounded-2xl font-bold mb-2">로그인하기</button>
            <button onClick={() => setShowLoginPrompt(false)} className="w-full text-gray-400 text-sm">나중에</button>
          </div>
        </div>
      )}
    </div>
  );
}
