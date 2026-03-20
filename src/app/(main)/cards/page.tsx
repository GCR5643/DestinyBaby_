'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Package } from 'lucide-react';
import CardPullAnimation from '@/components/cards/CardPullAnimation';
import CardCollection from '@/components/cards/CardCollection';
import { trpc } from '@/lib/trpc/client';
import { useUserStore } from '@/stores/userStore';
import type { Card, UserCard } from '@/types';

export default function CardsPage() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [tab, setTab] = useState<'pull' | 'collection'>('pull');
  const { user, updateCredits } = useUserStore();

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
    { enabled: tab === 'collection' }
  );

  const handlePull = (count: 1 | 10) => {
    pullMutation.mutate({ count });
  };

  const toggleFavoriteMutation = trpc.cards.toggleFavorite.useMutation({
    onSuccess: () => collectionQuery.refetch(),
  });

  // Derive free pulls remaining from user store (optimistic; server is source of truth)
  const freePullsRemaining = user
    ? Math.max(0, 3 - (user.total_pulls ?? 0))
    : 3;

  const collectionUserCards: UserCard[] = (collectionQuery.data?.cards ?? []) as UserCard[];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #2D1B69 100%)' }}>
      {/* Animation */}
      {isAnimating && (
        <CardPullAnimation
          cards={pulledCards}
          onComplete={() => { setIsAnimating(false); setTab('collection'); }}
          onSkip={() => { setIsAnimating(false); setTab('collection'); }}
        />
      )}

      {/* Header */}
      <div className="pt-12 pb-6 px-4 text-center text-white">
        <h1 className="text-2xl font-bold mb-1">운명 카드 뽑기</h1>
        <p className="text-sm text-white/60">사주로 결정되는 나만의 운명 카드</p>
        {user && (
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
            {collectionQuery.isLoading ? (
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
    </div>
  );
}
