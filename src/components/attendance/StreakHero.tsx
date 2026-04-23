'use client';

import { motion } from 'framer-motion';
import { Flame, Gem } from 'lucide-react';
import { OhengTheme, CozyPanel } from '@/components/cozy';
import { Button } from '@/components/ui/button';

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
    <OhengTheme element="fire">
      <CozyPanel element="fire" tone="pastel" padding="lg">
        {/* Streak count */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 mb-2"
          >
            <Flame className="w-8 h-8 text-oheng-fire-500" />
            <span className="font-display text-5xl font-black text-oheng-fire-700">{streak}</span>
            <span className="text-lg font-bold text-oheng-fire-600">일 연속</span>
          </motion.div>
          <p className="text-oheng-fire-500 text-sm">
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
            <div className="flex justify-between text-xs text-oheng-fire-400 mb-1">
              <span>{streak}일</span>
              <span className="flex items-center gap-1">
                <Gem className="w-3 h-3 text-yellow-500" />
                +{milestoneBonus}조각 보너스
              </span>
            </div>
            <div className="h-2 bg-oheng-fire-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${milestoneProgress * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-oheng-fire-300 to-oheng-fire-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Checkin button */}
        {checkedInToday ? (
          <Button
            variant="pastel"
            size="lg"
            disabled
            className="w-full cursor-not-allowed"
          >
            ✅ 오늘 출석 완료!
          </Button>
        ) : isLoading ? (
          <Button variant="oheng-fire" size="lg" disabled className="w-full">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
            />
            출석 중...
          </Button>
        ) : (
          <Button variant="oheng-fire" size="lg" onClick={onCheckin} className="w-full">
            <Gem className="w-4 h-4 text-yellow-300" />
            출석하고 조각 받기
          </Button>
        )}
      </CozyPanel>
    </OhengTheme>
  );
}
