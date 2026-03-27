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

  // 게스트 모드 state
  const [guestMode, setGuestMode] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestBirthDate, setGuestBirthDate] = useState('');

  // Get children list (로그인한 경우만)
  const { data: childrenData } = trpc.user.getChildren.useQuery(undefined, {
    enabled: !!user,
  });

  // Get fragment balance (로그인한 경우만)
  const { data: balanceData, refetch: refetchBalance } = trpc.fragments.getBalance.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Check if today's fortune exists (로그인+아이 선택한 경우만)
  const { data: todayCheck } = trpc.dailyFortune.hasTodayFortune.useQuery(
    { childId: selectedChildId! },
    { enabled: !!selectedChildId && !!user }
  );

  // 로그인 유저: 기존 fortune mutation
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

  // 게스트용 fortune mutation (로그인 불필요)
  const generateGuestFortune = trpc.dailyFortune.getGuestFortune.useMutation({
    onSuccess: (data) => {
      if (data.success && data.cards) {
        setFortuneCards(data.cards as FortuneCardType[]);
        setIsUnlocked(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    },
  });

  const children = childrenData?.children || [];
  const fragmentBalance = balanceData?.fragments ?? user?.destiny_fragments ?? 0;

  // 비로그인이거나 아이 없으면 게스트 모드
  useEffect(() => {
    if (!user || children.length === 0) {
      setGuestMode(true);
    } else {
      setGuestMode(false);
    }
  }, [user, children.length]);

  // Auto-select first child (로그인 유저)
  useEffect(() => {
    if (children.length && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Load cached fortune (로그인 유저)
  useEffect(() => {
    if (todayCheck?.hasFortune && todayCheck.fortune) {
      setFortuneCards(todayCheck.fortune.fortune_data as FortuneCardType[]);
      setIsUnlocked(true);
    }
  }, [todayCheck]);

  const handleUnlock = () => {
    if (!selectedChildId) return;
    generateFortune.mutate({ childId: selectedChildId });
  };

  const handleGuestUnlock = () => {
    if (!guestName.trim() || !guestBirthDate) return;
    generateGuestFortune.mutate({
      childName: guestName.trim(),
      birthDate: guestBirthDate,
    });
  };

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
            {!guestMode && <FragmentBadge balance={fragmentBalance} />}
          </div>

          {/* 로그인 유저 + 아이 여러명 */}
          {!guestMode && children.length > 1 && (
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
          {!guestMode && children.length === 1 && children[0] && (
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
            /* 해금된 카드들 */
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

              {/* 다시 보기 버튼 (게스트) */}
              {guestMode && (
                <button
                  onClick={() => {
                    setIsUnlocked(false);
                    setFortuneCards(null);
                  }}
                  className="w-full py-3 bg-amber-100 text-amber-700 rounded-xl font-bold text-sm mt-4"
                >
                  다른 아이 운세도 보기
                </button>
              )}

              {/* Confetti effect */}
              {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                  {Array.from({ length: 30 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: `${10 + (i * 2.8)}%`,
                        backgroundColor: ['#f093fb', '#f5576c', '#4facfe', '#f9ca24', '#43e97b'][i % 5],
                      }}
                      initial={{ y: -20, opacity: 1 }}
                      animate={{ y: 800, opacity: 0, rotate: i * 24 }}
                      transition={{ duration: 2 + (i % 3) * 0.5, delay: (i % 10) * 0.05 }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : guestMode ? (
            /* 게스트 모드: 이름+생년월일 입력 폼 */
            <motion.div
              key="guest-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-center mb-5">
                  <p className="text-lg font-bold text-gray-800 mb-1">
                    우리 아이 운세 보기 ✨
                  </p>
                  <p className="text-sm text-gray-500">
                    이름과 생년월일만 입력하면 바로 확인할 수 있어요
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">아이 이름</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="예: 서윤"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">생년월일</label>
                    <input
                      type="date"
                      value={guestBirthDate}
                      onChange={(e) => setGuestBirthDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGuestUnlock}
                  disabled={!guestName.trim() || !guestBirthDate || generateGuestFortune.isPending}
                  className="w-full mt-5 bg-gradient-to-r from-amber-400 to-orange-400 text-white py-3.5 rounded-xl font-bold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generateGuestFortune.isPending ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      운세 생성 중...
                    </>
                  ) : (
                    <>
                      <Sun className="w-5 h-5" />
                      오늘의 운수 확인하기
                    </>
                  )}
                </button>
              </div>

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
          ) : (
            /* 로그인 유저: 기존 해금 플로우 */
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <UnlockBanner
                fragmentBalance={fragmentBalance}
                cost={1}
                onUnlock={handleUnlock}
                onCharge={() => router.push('/wallet')}
                isLoading={generateFortune.isPending}
              />
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
