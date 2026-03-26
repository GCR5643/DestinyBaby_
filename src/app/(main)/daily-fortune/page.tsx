'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, ChevronDown } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useUserStore } from '@/stores/userStore';
import FortuneCard from '@/components/fortune/FortuneCard';
import FortuneCardLocked from '@/components/fortune/FortuneCardLocked';
import UnlockBanner from '@/components/fortune/UnlockBanner';
import FragmentBadge from '@/components/wallet/FragmentBadge';
import { useRouter } from 'next/navigation';
import { SKIP_AUTH } from '@/lib/auth/skip-auth';
import type { FortuneCard as FortuneCardType } from '@/types';

// 6종 카드 기본 메타
const CARD_META = [
  { type: 'fortune', emoji: '☀️', title: '오늘의 운세', color: 'gold-100' },
  { type: 'praise', emoji: '⭐', title: '칭찬 한마디', color: 'primary-100' },
  { type: 'love', emoji: '💖', title: '사랑 표현', color: 'secondary-100' },
  { type: 'fact', emoji: '🔬', title: '새로운 사실', color: 'green-100' },
  { type: 'conversation', emoji: '💬', title: '대화 주제', color: 'blue-100' },
  { type: 'parenting', emoji: '🌱', title: '육아팁', color: 'amber-100' },
];

export default function DailyFortunePage() {
  const router = useRouter();
  const { user, updateFragments } = useUserStore();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [fortuneCards, setFortuneCards] = useState<FortuneCardType[] | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Get children list
  const { data: childrenData } = trpc.user.getChildren.useQuery(undefined, {
    enabled: !!user || SKIP_AUTH,
  });

  // Get fragment balance
  const { data: balanceData, refetch: refetchBalance } = trpc.fragments.getBalance.useQuery(
    undefined,
    { enabled: !!user || SKIP_AUTH }
  );

  // Check if today's fortune exists
  const { data: todayCheck, refetch: refetchTodayCheck } = trpc.dailyFortune.hasTodayFortune.useQuery(
    { childId: selectedChildId! },
    { enabled: !!selectedChildId }
  );

  // Generate fortune mutation
  const generateFortune = trpc.dailyFortune.getDailyFortune.useMutation({
    onSuccess: (data) => {
      if (data.success && data.fortune) {
        setFortuneCards(data.fortune.fortune_data as FortuneCardType[]);
        setIsUnlocked(true);
        setShowConfetti(true);
        updateFragments(-1);
        refetchBalance();
        setTimeout(() => setShowConfetti(false), 3000);
      }
    },
  });

  // Auto-select first child
  useEffect(() => {
    if (childrenData?.children?.length && !selectedChildId) {
      setSelectedChildId(childrenData.children[0].id);
    }
  }, [childrenData, selectedChildId]);

  // Load cached fortune
  useEffect(() => {
    if (todayCheck?.hasFortune && todayCheck.fortune) {
      setFortuneCards(todayCheck.fortune.fortune_data as FortuneCardType[]);
      setIsUnlocked(true);
    } else {
      setFortuneCards(null);
      setIsUnlocked(false);
    }
  }, [todayCheck]);

  const handleUnlock = () => {
    if (!selectedChildId) return;
    generateFortune.mutate({ childId: selectedChildId });
  };

  const children = childrenData?.children || [];
  const fragmentBalance = balanceData?.fragments ?? user?.destiny_fragments ?? 0;

  // 로그인 안 된 경우 (SKIP_AUTH 시 우회)
  if (!user && !SKIP_AUTH) {
    return (
      <div className="min-h-screen bg-ivory pb-24 flex flex-col items-center justify-center px-4">
        <Sun className="w-16 h-16 text-amber-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-800 mb-2">오늘의 운수</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          아이의 사주를 기반으로 매일 맞춤 운수를 확인하세요
        </p>
        <button
          onClick={() => router.push('/login')}
          className="bg-primary-500 text-white px-6 py-3 rounded-xl font-bold text-sm"
        >
          로그인하고 시작하기
        </button>
      </div>
    );
  }

  // 아이가 없는 경우
  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-ivory pb-24 flex flex-col items-center justify-center px-4">
        <Sun className="w-16 h-16 text-amber-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-800 mb-2">오늘의 운수</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          아이를 등록하면 매일 사주 기반 맞춤 운수를 받을 수 있어요
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="bg-primary-500 text-white px-6 py-3 rounded-xl font-bold text-sm"
        >
          아이 등록하러 가기
        </button>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 pt-12 pb-6 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sun className="w-7 h-7 text-amber-500" />
                오늘의 운수
              </h1>
              <p className="text-sm text-gray-500 mt-1">{todayStr}</p>
            </div>
            <FragmentBadge balance={fragmentBalance} />
          </div>

          {/* Child selector */}
          {children.length > 1 && (
            <div className="relative">
              <select
                value={selectedChildId || ''}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 appearance-none pr-10"
              >
                {children.map((child: { id: string; name: string }) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
          {children.length === 1 && children[0] && (
            <p className="text-sm font-medium text-amber-700 bg-amber-100/50 rounded-lg px-3 py-1.5 inline-block">
              {children[0].name}의 운수
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 mt-6 space-y-4">
        <AnimatePresence mode="wait">
          {isUnlocked && fortuneCards ? (
            /* 해금된 카드들 - stagger reveal */
            <motion.div
              key="unlocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {fortuneCards.map((card, i) => (
                <FortuneCard
                  key={card.type}
                  emoji={card.emoji}
                  title={card.title}
                  content={card.content}
                  color={card.color}
                  index={i}
                />
              ))}

              {/* Confetti effect */}
              {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                  {Array.from({ length: 30 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: ['#f093fb', '#f5576c', '#4facfe', '#f9ca24', '#43e97b'][i % 5],
                      }}
                      initial={{ y: -20, opacity: 1 }}
                      animate={{ y: window.innerHeight + 20, opacity: 0, rotate: Math.random() * 720 }}
                      transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.5 }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            /* 잠긴 카드들 + 해금 CTA */
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {/* Unlock banner */}
              <UnlockBanner
                fragmentBalance={fragmentBalance}
                cost={1}
                onUnlock={handleUnlock}
                onCharge={() => router.push('/wallet')}
                isLoading={generateFortune.isPending}
              />

              {/* Locked card previews */}
              {CARD_META.map((meta, i) => (
                <FortuneCardLocked
                  key={meta.type}
                  emoji={meta.emoji}
                  title={meta.title}
                  color={meta.color}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
