'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Gem } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useUserStore } from '@/stores/userStore';
import StreakHero from '@/components/attendance/StreakHero';
import MonthlyCalendar from '@/components/attendance/MonthlyCalendar';
import FragmentBadge from '@/components/wallet/FragmentBadge';
import { useRouter } from 'next/navigation';

// Milestone info
const MILESTONES = [
  { days: 7, bonus: 3, label: '7일 연속' },
  { days: 14, bonus: 5, label: '14일 연속' },
  { days: 30, bonus: 10, label: '30일 연속' },
];

export default function AttendancePage() {
  const router = useRouter();
  const { user, updateFragments } = useUserStore();
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);

  // Streak query
  const { data: streakData, refetch: refetchStreak } = trpc.checkin.getStreak.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Monthly history
  const { data: historyData, refetch: refetchHistory } = trpc.checkin.getMonthlyHistory.useQuery(
    { year: calYear, month: calMonth },
    { enabled: !!user }
  );

  // Fragment balance
  const { data: balanceData, refetch: refetchBalance } = trpc.fragments.getBalance.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Checkin mutation
  const doCheckin = trpc.checkin.doCheckin.useMutation({
    onSuccess: (data) => {
      if (!data.alreadyCheckedIn && 'total_earned' in data) {
        const earned = data.total_earned || 1;
        setEarnedAmount(earned);
        setShowSuccess(true);
        updateFragments(earned);
        refetchStreak();
        refetchHistory();
        refetchBalance();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    },
  });

  const handleCheckin = useCallback(() => {
    doCheckin.mutate();
  }, [doCheckin]);

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCalYear(year);
    setCalMonth(month);
  }, []);

  const streak = streakData?.streak ?? 0;
  const checkedInToday = streakData?.checkedInToday ?? false;
  const fragmentBalance = balanceData?.fragments ?? user?.destiny_fragments ?? 0;
  const checkinDates = historyData?.records ?? [];

  if (!user) {
    return (
      <div className="min-h-screen bg-ivory pb-24 flex flex-col items-center justify-center px-4">
        <CalendarDays className="w-16 h-16 text-primary-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-800 mb-2">출석 체크</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          매일 출석하고 운명의 조각을 모아보세요
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

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-50 to-indigo-50 pt-12 pb-6 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="w-7 h-7 text-primary-500" />
              출석 체크
            </h1>
            <FragmentBadge balance={fragmentBalance} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 mt-6 space-y-5">
        {/* Streak Hero + Checkin button */}
        <StreakHero
          streak={streak}
          checkedInToday={checkedInToday}
          onCheckin={handleCheckin}
          isLoading={doCheckin.isPending}
        />

        {/* Monthly Calendar */}
        <MonthlyCalendar
          year={calYear}
          month={calMonth}
          checkinDates={checkinDates}
          onMonthChange={handleMonthChange}
        />

        {/* Milestone rewards */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">연속 출석 보너스</h3>
          <div className="space-y-3">
            {MILESTONES.map((m) => {
              const achieved = streak >= m.days;
              return (
                <div
                  key={m.days}
                  className={`flex items-center justify-between py-2 px-3 rounded-xl ${
                    achieved ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        achieved
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {achieved ? '✓' : m.days}
                    </div>
                    <span className={`text-sm font-medium ${achieved ? 'text-green-700' : 'text-gray-600'}`}>
                      {m.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-amber-600">
                    <Gem className="w-4 h-4 text-amber-500" />
                    +{m.bonus}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2">
              <Gem className="w-5 h-5 text-yellow-300" />
              <span className="font-bold">+{earnedAmount} 조각 획득!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
