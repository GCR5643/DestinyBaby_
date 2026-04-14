'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogIn } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useUserStore } from '@/stores/userStore';
import FortuneCard from '@/components/fortune/FortuneCard';
import FortuneCardLocked from '@/components/fortune/FortuneCardLocked';
import FragmentBadge from '@/components/wallet/FragmentBadge';
import Link from 'next/link';
import { SKIP_AUTH } from '@/lib/auth/skip-auth';
import type { FortuneCard as FortuneCardType } from '@/types';
import KoreanLuckyBag from '@/components/fortune/KoreanLuckyBag';

const CARD_META = [
  { type: 'fortune', emoji: '☀️', title: '오늘의 운세', color: 'gold-100' },
  { type: 'praise', emoji: '⭐', title: '칭찬 한마디', color: 'primary-100' },
  { type: 'love', emoji: '💖', title: '사랑 표현', color: 'secondary-100' },
  { type: 'fact', emoji: '🔬', title: '새로운 사실', color: 'green-100' },
  { type: 'conversation', emoji: '💬', title: '대화 주제', color: 'blue-100' },
  { type: 'parenting', emoji: '🌱', title: '육아팁', color: 'amber-100' },
];

function getFortunePeriod(): 'morning' | 'evening' {
  return new Date().getHours() < 12 ? 'morning' : 'evening';
}

function getPeriodLabel(): string {
  return getFortunePeriod() === 'morning' ? '🌅 오전 운세' : '🌙 저녁 운세';
}

function getNextRenewalTime(): string {
  return getFortunePeriod() === 'morning' ? '낮 12시에 저녁 운세가 열려요' : '내일 아침 12시에 오전 운세가 열려요';
}

/** 게스트: 현재 기간(오전/저녁) 사용 여부 확인 */
function getGuestPeriodKey(): string {
  const today = new Date().toISOString().split('T')[0];
  const period = getFortunePeriod();
  return `fortune_guest_${today}_${period}`;
}

function hasGuestUsedThisPeriod(): boolean {
  try { return localStorage.getItem(getGuestPeriodKey()) === 'used'; } catch { return false; }
}

function markGuestPeriodUsed(): void {
  try { localStorage.setItem(getGuestPeriodKey(), 'used'); } catch { /* ignore */ }
}

export default function DailyFortunePage() {
  const { user, updateFragments } = useUserStore();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [fortuneCards, setFortuneCards] = useState<FortuneCardType[] | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [guestLimitReached, setGuestLimitReached] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // 게스트 입력
  const [guestName, setGuestName] = useState('');
  const [guestBirthDate, setGuestBirthDate] = useState('');
  const [guestBirthTime, setGuestBirthTime] = useState('');

  const { data: childrenData } = trpc.user.getChildren.useQuery(undefined, { enabled: !!user || SKIP_AUTH });
  const { data: balanceData, refetch: refetchBalance } = trpc.fragments.getBalance.useQuery(undefined, { enabled: !!user || SKIP_AUTH });

  const children = childrenData?.children || [];
  const fragmentBalance = balanceData?.fragments ?? user?.destiny_fragments ?? 0;
  const isGuest = !user && !SKIP_AUTH;

  const { data: todayCheck } = trpc.dailyFortune.hasTodayFortune.useQuery(
    { childId: selectedChildId! },
    { enabled: !!selectedChildId && (!!user || SKIP_AUTH) }
  );

  const generateFortune = trpc.dailyFortune.getDailyFortune.useMutation({
    onSuccess: (data) => {
      if (data.success && data.fortune) {
        setFortuneCards(data.fortune.fortune_data as FortuneCardType[]);
        setIsUnlocked(true);
        setShowConfetti(true);
        if (!data.wasFree) { updateFragments(-1); refetchBalance(); }
        setTimeout(() => setShowConfetti(false), 3000);
      }
    },
  });

  const generateGuestFortune = trpc.dailyFortune.getGuestFortune.useMutation({
    onSuccess: (data) => {
      if (data.success && data.cards) {
        markGuestPeriodUsed();
        setFortuneCards(data.cards as FortuneCardType[]);
        setIsUnlocked(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    },
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fortune_guest_child');
      if (saved) {
        const { name, birthDate, birthTime } = JSON.parse(saved);
        if (name) setGuestName(name);
        if (birthDate) setGuestBirthDate(birthDate);
        if (birthTime) setGuestBirthTime(birthTime);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (children.length && !selectedChildId) setSelectedChildId(children[0].id);
  }, [children, selectedChildId]);

  useEffect(() => {
    if (todayCheck?.hasFortune && todayCheck.fortune) {
      setFortuneCards(todayCheck.fortune.fortune_data as FortuneCardType[]);
      setIsUnlocked(true);
    }
  }, [todayCheck]);

  /** 복주머니 탭 → 흔들기 → 운세 생성 */
  const handleBagTap = useCallback((unlockFn: () => void) => {
    if (isShaking || generateFortune.isPending || generateGuestFortune.isPending) return;
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      unlockFn();
    }, 700);
  }, [isShaking, generateFortune.isPending, generateGuestFortune.isPending]);

  const handleGuestUnlock = useCallback(() => {
    if (!guestName.trim() || !guestBirthDate) return;
    // guestBirthTime is optional — proceed even if empty
    if (hasGuestUsedThisPeriod()) { setGuestLimitReached(true); return; }
    localStorage.setItem('fortune_guest_child', JSON.stringify({ name: guestName.trim(), birthDate: guestBirthDate, birthTime: guestBirthTime }));
    generateGuestFortune.mutate({ childName: guestName.trim(), birthDate: guestBirthDate, birthTime: guestBirthTime || undefined });
  }, [guestName, guestBirthDate, guestBirthTime, generateGuestFortune]);

  const handleLoggedInUnlock = useCallback(() => {
    if (!selectedChildId) return;
    generateFortune.mutate({ childId: selectedChildId });
  }, [selectedChildId, generateFortune]);

  const todayFortuneExists = todayCheck?.hasFortune;
  const isPending = generateFortune.isPending || generateGuestFortune.isPending;

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
                {getPeriodLabel()}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{todayStr}</p>
            </div>
            {!isGuest && <FragmentBadge balance={fragmentBalance} />}
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

              {/* 다음 갱신 안내 */}
              <p className="text-center text-xs text-gray-400 pt-1">🔄 {getNextRenewalTime()}</p>

              {isGuest && (
                <div className="space-y-3 pt-2">
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-5 text-center">
                    <p className="text-sm font-bold text-gray-800 mb-1">매일 2회 무료 운세 + 조각 10개 🎁</p>
                    <p className="text-xs text-gray-500 mb-3">회원가입하면 오전·저녁 운세가 매일 무료!</p>
                    <Link href="/login?redirect=/daily-fortune" className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm">
                      <LogIn className="w-4 h-4" /> 무료 회원가입
                    </Link>
                  </div>
                </div>
              )}

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
                <h2 className="text-lg font-bold text-gray-800 mb-2">이번 운세는 모두 확인했어요</h2>
                <p className="text-sm text-gray-500 mb-2">{getNextRenewalTime()} ✨</p>
                <p className="text-sm text-gray-500 mb-6">
                  회원가입하면 오전·저녁 매일 2회 무료!<br />
                  지금 가입하면 <strong className="text-primary-600">운명의 조각 10개</strong>를 드려요
                </p>
                <Link href="/login?redirect=/daily-fortune" className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-lg">
                  <LogIn className="w-5 h-5" /> 무료 회원가입하기
                </Link>
              </div>
            </motion.div>

          ) : isGuest || (!isGuest && children.length === 0) ? (
            /* ===== 게스트 입력 폼 ===== */
            <motion.div key="guest-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-center mb-5">
                  <p className="text-lg font-bold text-gray-800 mb-1">우리 아이 운세 보기 ✨</p>
                  <p className="text-sm text-gray-500">이름과 생년월일을 입력하면 바로 확인할 수 있어요</p>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      태어난 시간 <span className="text-gray-400 font-normal">(모르면 생략 가능)</span>
                    </label>
                    <select
                      value={guestBirthTime}
                      onChange={(e) => setGuestBirthTime(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none bg-white"
                    >
                      <option value="">모름</option>
                      <option value="00:00">자시 (23~01시)</option>
                      <option value="02:00">축시 (01~03시)</option>
                      <option value="04:00">인시 (03~05시)</option>
                      <option value="06:00">묘시 (05~07시)</option>
                      <option value="08:00">진시 (07~09시)</option>
                      <option value="10:00">사시 (09~11시)</option>
                      <option value="12:00">오시 (11~13시)</option>
                      <option value="14:00">미시 (13~15시)</option>
                      <option value="16:00">신시 (15~17시)</option>
                      <option value="18:00">유시 (17~19시)</option>
                      <option value="20:00">술시 (19~21시)</option>
                      <option value="22:00">해시 (21~23시)</option>
                    </select>
                  </div>
                </div>

                {/* 복주머니 인터랙션 */}
                <div className="mt-6 flex flex-col items-center gap-3">
                  <p className="text-sm text-gray-500">복주머니를 눌러서 운세를 확인하세요 🎊</p>
                  <motion.button
                    onClick={() => handleBagTap(handleGuestUnlock)}
                    disabled={!guestName.trim() || !guestBirthDate || isPending}
                    className="text-8xl select-none disabled:opacity-40 cursor-pointer"
                    animate={isShaking ? {
                      rotate: [0, -18, 18, -18, 18, -12, 12, -6, 6, 0],
                      scale: [1, 1.12, 1.12, 1.12, 1.12, 1.07, 1.07, 1.03, 1.03, 1],
                    } : {}}
                    transition={{ duration: 0.7 }}
                    whileTap={{ scale: 0.93 }}
                  >
                    {isPending
                      ? <span className="text-6xl">✨</span>
                      : <KoreanLuckyBag className="w-28 h-28 drop-shadow-lg" />
                    }
                  </motion.button>
                  {isPending && (
                    <p className="text-sm text-amber-600 font-medium animate-pulse">운세 생성 중...</p>
                  )}
                </div>
              </div>
              {CARD_META.map((meta, i) => (
                <FortuneCardLocked key={meta.type} emoji={meta.emoji} title={meta.title} color={meta.color} index={i} />
              ))}
            </motion.div>

          ) : (
            /* ===== 로그인 유저: 복주머니 CTA ===== */
            <motion.div key="locked-user" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                {!todayFortuneExists ? (
                  <div className="text-center space-y-2">
                    <p className="text-base font-bold text-gray-800">
                      {getPeriodLabel()} <span className="text-amber-500">무료</span>예요! 🎉
                    </p>
                    <p className="text-xs text-gray-500">복주머니를 눌러서 운세를 확인하세요 🎊</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-base font-bold text-gray-800">추가 아이 운세 보기</p>
                    <p className="text-xs text-gray-500">운명의 조각 1개가 필요해요 (보유: {fragmentBalance}개)</p>
                    {fragmentBalance < 1 && (
                      <Link href="/profile/fragments" className="block w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm text-center mt-3">
                        조각 충전하러 가기
                      </Link>
                    )}
                  </div>
                )}

                {/* 복주머니 */}
                {((!todayFortuneExists) || (todayFortuneExists && fragmentBalance >= 1)) && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <motion.button
                      onClick={() => handleBagTap(handleLoggedInUnlock)}
                      disabled={isPending}
                      className="text-8xl select-none disabled:opacity-40 cursor-pointer"
                      animate={isShaking ? {
                        rotate: [0, -20, 20, -20, 20, -15, 15, -8, 8, 0],
                        scale: [1, 1.15, 1.15, 1.15, 1.15, 1.1, 1.1, 1.05, 1.05, 1],
                      } : {}}
                      transition={{ duration: 0.7 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPending ? '✨' : '🧧'}
                    </motion.button>
                    {isPending && (
                      <p className="text-sm text-amber-600 font-medium animate-pulse">운세 생성 중...</p>
                    )}
                    {!isPending && todayFortuneExists && (
                      <p className="text-xs text-gray-400">조각 1개 차감됩니다</p>
                    )}
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-gray-400">🔄 {getNextRenewalTime()}</p>

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
