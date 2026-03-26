'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface FortuneCardLockedProps {
  emoji: string;
  title: string;
  color: string;
  index: number;
}

export default function FortuneCardLocked({ emoji, title, color, index }: FortuneCardLockedProps) {
  const colorMap: Record<string, string> = {
    'gold-100': 'bg-amber-50/60 border-amber-200/50',
    'primary-100': 'bg-purple-50/60 border-purple-200/50',
    'secondary-100': 'bg-pink-50/60 border-pink-200/50',
    'green-100': 'bg-emerald-50/60 border-emerald-200/50',
    'blue-100': 'bg-blue-50/60 border-blue-200/50',
    'amber-100': 'bg-orange-50/60 border-orange-200/50',
  };

  const bgClass = colorMap[color] || 'bg-gray-50/60 border-gray-200/50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`relative rounded-2xl border p-4 ${bgClass} overflow-hidden`}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10 flex items-center justify-center">
        <div className="bg-white/80 rounded-full p-2 shadow-sm">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      {/* Blurred content preview */}
      <div className="flex items-start gap-3 opacity-40">
        <span className="text-2xl flex-shrink-0">{emoji}</span>
        <div>
          <h3 className="font-bold text-gray-800 text-sm mb-1">{title}</h3>
          <p className="text-gray-400 text-sm">운명의 조각으로 열어보세요...</p>
        </div>
      </div>
    </motion.div>
  );
}
