'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, ChevronDown, LogIn } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useUserStore } from '@/stores/userStore';
import FortuneCard from '@/components/fortune/FortuneCard';
import FortuneCardLocked from '@/components/fortune/FortuneCardLocked';
import FragmentBadge from '@/components/wallet/FragmentBadge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { FortuneCard as FortuneCardType } from '@/types';

const CARD_META = [
  { type: 'fortune', emoji: '☀️', title: '오늘의 운세', color: 'gold-100' },
  { type: 'praise', emoji: '⭐', title: '칭찬 한마디', color: 'primary-100' },
  { type: 'love', emoji: '💖', title: '사랑 표현', color: 'secondary-100' },
  { type: 'fact', emoji: '🔬', title: '새로운 사실', color: 'green-100' },
  { type: 'conversation', emoji: '💬', title: '대화 주제', color: 'blue-100' },
  { type: 'parenting', emoji: '🌱', title: '육아팁', color: 'amber-100' },
];

const GUEST_DAILY_LIMIT = 3;

function getGuestUsageToday(): number {
  try {
    const stored = localStorage.getItem('fortune_guest_usage');
    if (!stored) return 0;
    const { date, count } = JSON.parse(stored);
    if (date === new Date().toISOString().split('T')[0]) return count;
    return 0;
  } catch { return 0; }
}

function incrementGuestUsage(): number {
  const today = new Date().toISOString().split('T')[0];
  const current = getGuestUsageToday();
  const next = current + 1;
  localStorage.setItem('fortune_guest_usage', JSON.stringify({ date: today, count: next }));
  return next;
}

export default function DailyFortunePage() {
  const router = useRouter();
  const { user, updateFragments } = useUserStore();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [fortuneCards, setFortuneCards] = useState<FortuneCardType[] | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [guestUsage, setGuestUsage] = useState(0);
  const [guestLimitReached, setGuestLimitReached] = useState(false);

  // 게스트 입력
  const [guestName, setGuestName] = useState('');
  const [guestBirthDate, setGuestBirthDate] = useState('');

  // 로그인 유저 데이터
  const { data: childrenData } = trpc.user.getChildren.useQuery(undefined, { enabled: !!user });
  const { data: balanceData, refetch: refetchBalance } = trpc.fragments.getBalance.useQuery(undefined, { enabled: !!user });

  const children = childrenData?.children || [];
  const fragmentBalance = balanceData?.fragments ?? user?.destiny_fragments ?? 0;
  const isGuest = !user;

  // 오늘 이미 생성된 운세 확인 (로그인 유저)
  const { data: todayCheck } = trpc.dailyFortune.hasTodayFortune.useQuery(
    { childId: selectedChildId! },
    { enabled: !!selectedChildId && !!user }
  );

  // 로그인 유저: fortune mutation
  const generateFortune = trpc.dailyFortune.getDailyFortune.useMutation({
    onSuccess: (data) => {
      if (data.success && data.fortune) {
        setFortuneCards(data.fortune.fortune_data as FortuneCardType[]);
        setIsUnlocked(true);
        setShowConfetti(true);
        if (!data.wasFree) {
          updateFragments(-1);
          refetchBalance();
        }
        setTimeout(() => setShowConfetti(false), 3000);
      }
    },
  });

  // 게스트 fortune mutation
  const generateGuestFortune = trpc.dailyFortune.getGuestFortune.useMutation({
    onSuccess: (data) => {
      if (data.success && data.cards) {
        const used = incrementGuestUsage();
        setGuestUsage(used);
        setFortuneCards(data.cards as FortuneCardType[]);
        setIsUnlocked(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    },
  });

  // localStorage 게스트 입력 복원
  useEffect(() => {
    setGuestUsage(getGuestUsageToday());
    try {
      const saved = localStorage.getItem('fortune_guest_child');
      if (saved) {
        const { name, birthDate } = JSON.parse(saved);
        if (name) setGuestName(name);
        if (birthDate) setGuestBirthDate(birthDate);
      }
    } catch { /* ignore */ }
  }, []);

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

  const handleGuestUnlock = useCallback(() => {
    if (!guestName.trim() || !guestBirthDate) return;
    if (getGuestUsageToday() >= GUEST_DAILY_LIMIT) {
      setGuestLimitReached(true);
      return;
    }
    // localStorage에 입력값 저장 (재방문 시 자동 입력)
    localStorage.setItem('fortune_guest_child', JSON.stringify({ name: guestName.trim(), birthDate: guestBirthDate }));
    generateGuestFortune.mutate({ childName: guestName.trim(), birthDate: guestBirthDate });
  }, [guestName, guestBirthDate, generateGuestFortune]);

  const handleLoggedInUnlock = useCallback(() => {
    if (!selectedChildId) return;
    generateFortune.mutate({ childId: selectedChildId });
  }, [selectedChildId, generateFortune]);

  // 오늘 첫 번째 아이인지 (로그인 유저 무료 여부 표시용)
  const todayFortuneExists = todayCheck?.hasFortune;

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
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
            {!isGuest && <FragmentBadge balance={fragmentBalance} />}
            {isGuest && (
              <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-medium">
                무료 {GUEST_DAILY_LIMIT - guestUsage}회 남음
              </span>
            )}
          </div>

          {/* 로그인 유저: 아이 선택 */}
          {!isGuest && children.length > 1 && (
            <div className="relative">
              <select
                value={selectedChildId || ''}
                onChange={(e) => {
                  setSelectedChildId(e.target.value);
                  setFortuneCards(null);
                  setIsUnlocked(false);
                }}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 appearance-none pr-10"
              >
                {children.map((child: { id: string; name: string }) => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
          {!isGuest && children.length === 1 && children[0] && (
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
            /* ===== 해금된 카드들 ===== */
            <motion.div key="unlocked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {fortuneCards.map((card, i) => (
                <FortuneCard key={card.type} emoji={card.emoji} title={card.title} content={card.content} color={card.color} index={i} />
              ))}

              {/* 게스트: 다시 보기 + 회원가입 유도 */}
              {isGuest && (
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => { setIsUnlocked(false); setFortuneCards(null); }}
                    className="w-full py-3 bg-amber-100 text-amber-700 rounded-xl font-bold text-sm"
                  >
                    다른 아이 운세도 보기 ({GUEST_DAILY_LIMIT - guestUsage}회 남음)
                  </button>
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-5 text-center">
                    <p className="text-sm font-bold text-gray-800 mb-1">매일 무료 운세 + 조각 10개 🎁</p>
                    <p className="text-xs text-gray-500 mb-3">회원가입하면 매일 첫 아이 운세가 무료!</p>
                    <Link href="/login?redirect=/daily-fortune" className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm">
                      <LogIn className="w-4 h-4" /> 무료 회원가입
                    </Link>
                  </div>
                </div>
              )}

              {/* 로그인 유저: 다른 아이 보기 */}
              {!isGuest && children.length > 1 && (
                <p className="text-center text-xs text-gray-400 pt-2">
                  다른 아이 운세는 상단에서 아이를 선택해 주세요 (조각 1개)
                </p>
              )}

              {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                  {Array.from({ length: 30 }, (_, i) => (
                    <motion.div key={i} className="absolute w-2 h-2 rounded-full"
                      style={{ left: `${10 + (i * 2.8)}%`, backgroundColor: ['#f093fb', '#f5576c', '#4facfe', '#f9ca24', '#43e97b'][i % 5] }}
                      initial={{ y: -20, opacity: 1 }}
                      animate={{ y: 800, opacity: 0, rotate: i * 24 }}
                      transition={{ duration: 2 + (i % 3) * 0.5, delay: (i % 10) * 0.05 }}
                    />
                  ))}
                </div>
              )}
            </motion.div>

          ) : guestLimitReached ? (
            /* ===== 게스트 한도 초과 ===== */
            <motion.div key="limit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <div className="text-5xl mb-4">🔮</div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">오늘의 무료 운세를 모두 사용했어요</h2>
                <p className="text-sm text-gray-500 mb-6">
                  회원가입하면 매일 첫 아이 운세 무료!<br />
                  지금 가입하면 <strong className="text-primary-600">운명의 조각 10개</strong>를 드려요 ✨
                </p>
                <Link href="/login?redirect=/daily-fortune" className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-lg">
                  <LogIn className="w-5 h-5" /> 무료 회원가입하기
                </Link>
                <p className="text-xs text-gray-400 mt-3">내일 다시 무료 3회 충전돼요</p>
              </div>
            </motion.div>

          ) : isGuest || (!isGuest && children.length === 0) ? (
            /* ===== 게스트 입력 폼 ===== */
            <motion.div key="guest-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-center mb-5">
                  <p className="text-lg font-bold text-gray-800 mb-1">우리 아이 운세 보기 ✨</p>
                  <p className="text-sm text-gray-500">이름과 생년월일만 입력하면 바로 확인할 수 있어요</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">아이 이름</label>
                    <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)}
                      placeholder="예: 서윤"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">생년월일</label>
                    <input type="date" value={guestBirthDate} onChange={(e) => setGuestBirthDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none" />
                  </div>
                </div>
                <button onClick={handleGuestUnlock}
                  disabled={!guestName.trim() || !guestBirthDate || generateGuestFortune.isPending}
                  className="w-full mt-5 bg-gradient-to-r from-amber-400 to-orange-400 text-white py-3.5 rounded-xl font-bold text-base shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                  {generateGuestFortune.isPending ? (
                    <><motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> 운세 생성 중...</>
                  ) : (
                    <><Sun className="w-5 h-5" /> 오늘의 운수 확인하기 (무료)</>
                  )}
                </button>
              </div>
              {CARD_META.map((meta, i) => (
                <FortuneCardLocked key={meta.type} emoji={meta.emoji} title={meta.title} color={meta.color} index={i} />
              ))}
            </motion.div>

          ) : (
            /* ===== 로그인 유저: 해금 CTA ===== */
            <motion.div key="locked-user" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {/* 무료/유료 안내 배너 */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                {!todayFortuneExists ? (
                  <div className="text-center">
                    <p className="text-base font-bold text-gray-800 mb-1">오늘 첫 운세는 <span className="text-amber-500">무료</span>예요! 🎉</p>
                    <p className="text-xs text-gray-500 mb-4">매일 첫 번째 아이의 운세를 무료로 확인하세요</p>
                    <button onClick={handleLoggedInUnlock}
                      disabled={generateFortune.isPending}
                      className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-white py-3.5 rounded-xl font-bold text-base shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                      {generateFortune.isPending ? (
                        <><motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> 운세 생성 중...</>
                      ) : (
                        <><Sun className="w-5 h-5" /> 무료로 운수 확인하기</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-base font-bold text-gray-800 mb-1">추가 아이 운세 보기</p>
                    <p className="text-xs text-gray-500 mb-4">운명의 조각 1개가 필요해요 (보유: {fragmentBalance}개)</p>
                    {fragmentBalance >= 1 ? (
                      <button onClick={handleLoggedInUnlock}
                        disabled={generateFortune.isPending}
                        className="w-full bg-gradient-to-r from-purple-400 to-primary-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                        {generateFortune.isPending ? (
                          <><motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> 운세 생성 중...</>
                        ) : (
                          <>🔮 조각 1개로 운수 확인하기</>
                        )}
                      </button>
                    ) : (
                      <Link href="/profile/fragments" className="block w-full bg-gray-100 text-gray-600 py-3.5 rounded-xl font-bold text-base text-center">
                        조각 충전하러 가기
                      </Link>
                    )}
                  </div>
                )}
              </div>
              {CARD_META.map((meta, i) => (
                <FortuneCardLocked key={meta.type} emoji={meta.emoji} title={meta.title} color={meta.color} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
