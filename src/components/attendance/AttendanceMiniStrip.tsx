'use client';

import { motion } from 'framer-motion';
import { Flame, Gem, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AttendanceMiniStripProps {
  streak: number;
  checkedInToday: boolean;
  onCheckin: () => void;
  isLoading?: boolean;
}

export default function AttendanceMiniStrip({
  streak,
  checkedInToday,
  onCheckin,
  isLoading = false,
}: AttendanceMiniStripProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-oheng-fire-50 rounded-card border border-oheng-fire-200 shadow-soft p-3"
    >
      <div className="flex items-center justify-between">
        <Link href="/attendance" className="flex items-center gap-2 min-w-0">
          <Flame className="w-5 h-5 text-oheng-fire-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">
              {streak > 0 ? `🔥 ${streak}일 연속 출석!` : '오늘 출석하고 조각 받기'}
            </p>
            {!checkedInToday && (
              <p className="text-xs text-oheng-fire-400">
                <Gem className="inline w-3 h-3 mr-0.5" />출석하면 조각 1개 지급
              </p>
            )}
          </div>
        </Link>

        {checkedInToday ? (
          <Link
            href="/attendance"
            className="flex items-center gap-1 text-xs text-oheng-fire-500 font-medium flex-shrink-0"
          >
            확인 <ChevronRight className="w-3 h-3" />
          </Link>
        ) : (
          <Button
            variant="oheng-fire"
            size="sm"
            onClick={(e) => { e.preventDefault(); onCheckin(); }}
            disabled={isLoading}
            className="flex-shrink-0 text-xs"
          >
            {isLoading ? '...' : '출석'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
