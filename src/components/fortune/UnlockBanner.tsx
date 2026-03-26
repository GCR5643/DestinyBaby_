'use client';

import { motion } from 'framer-motion';
import { Gem, AlertCircle } from 'lucide-react';

interface UnlockBannerProps {
  fragmentBalance: number;
  cost: number;
  onUnlock: () => void;
  onCharge: () => void;
  isLoading?: boolean;
}

export default function UnlockBanner({
  fragmentBalance,
  cost,
  onUnlock,
  onCharge,
  isLoading = false,
}: UnlockBannerProps) {
  const canAfford = fragmentBalance >= cost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg"
    >
      <div className="text-center mb-3">
        <Gem className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
        <h3 className="font-bold text-lg">오늘의 운수를 확인해보세요</h3>
        <p className="text-white/80 text-sm mt-1">
          운명의 조각 {cost}개로 6가지 맞춤 운수를 열어보세요
        </p>
      </div>

      {canAfford ? (
        <button
          onClick={onUnlock}
          disabled={isLoading}
          className="w-full bg-white text-primary-600 font-bold py-3 rounded-xl text-sm hover:bg-white/90 transition disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full"
              />
              운수 확인 중...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Gem className="w-4 h-4" />
              조각 {cost}개 사용하여 열기
              <span className="text-xs text-primary-400">(보유: {fragmentBalance}개)</span>
            </span>
          )}
        </button>
      ) : (
        <div>
          <div className="flex items-center justify-center gap-2 text-yellow-200 text-sm mb-3">
            <AlertCircle className="w-4 h-4" />
            <span>조각이 부족해요 (보유: {fragmentBalance}개)</span>
          </div>
          <button
            onClick={onCharge}
            className="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl text-sm hover:bg-yellow-300 transition"
          >
            💎 운명의 조각 충전하기
          </button>
        </div>
      )}
    </motion.div>
  );
}
