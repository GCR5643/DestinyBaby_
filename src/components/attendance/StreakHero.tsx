'use client';

import { motion } from 'framer-motion';
import { Flame, Gem } from 'lucide-react';

interface StreakHeroProps {
  streak: number;
  checkedInToday: boolean;
  onCheckin: () => void;
  isLoading?: boolean;
}

export default function StreakHero({ streak, checkedInToday, onCheckin, isLoading = false }: StreakHeroProps) {
  // Milestone progress
  const nextMilestone = streak < 7 ? 7 : streak < 14 ? 14 : streak < 30 ? 30 : 30;
  const milestoneProgress = streak < 7 ? streak / 7 : streak < 14 ? streak / 14 : streak < 30 ? streak / 30 : 1;
  const milestoneBonus = nextMilestone === 7 ? 3 : nextMilestone === 14 ? 5 : 10;

  return (
    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
      {/* Streak count */}
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center gap-2 mb-2"
        >
          <Flame className="w-8 h-8 text-orange-300" />
          <span className="text-5xl font-black">{streak}</span>
          <span className="text-lg font-bold text-white/80">일 연속</span>
        </motion.div>
        <p className="text-white/60 text-sm">
          {streak === 0
            ? '오늘부터 출석을 시작해보세요!'
            : streak >= 30
            ? '🎉 대단해요! 30일 연속 달성!'
            : `${nextMilestone}일 연속까지 ${nextMilestone - streak}일 남았어요`}
        </p>
      </div>

      {/* Milestone progress bar */}
      {streak < 30 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>{streak}일</span>
            <span className="flex items-center gap-1">
              <Gem className="w-3 h-3 text-yellow-300" />
              +{milestoneBonus}조각 보너스
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${milestoneProgress * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Checkin button */}
      <button
        onClick={onCheckin}
        disabled={checkedInToday || isLoading}
        className={`w-full py-3 rounded-xl font-bold text-sm transition ${
          checkedInToday
            ? 'bg-white/20 text-white/60 cursor-not-allowed'
            : 'bg-white text-primary-600 hover:bg-white/90 active:scale-[0.98]'
        }`}
      >
        {checkedInToday ? (
          <span className="flex items-center justify-center gap-2">
            ✅ 오늘 출석 완료!
          </span>
        ) : isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full"
            />
            출석 중...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Gem className="w-4 h-4 text-yellow-500" />
            출석하고 조각 받기
          </span>
        )}
      </button>
    </div>
  );
}
