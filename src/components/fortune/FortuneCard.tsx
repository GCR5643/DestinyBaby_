'use client';

import { motion } from 'framer-motion';

interface FortuneCardProps {
  emoji: string;
  title: string;
  content: string;
  color: string;
  index: number;
}

export default function FortuneCard({ emoji, title, content, color, index }: FortuneCardProps) {
  // Map color names to actual Tailwind classes
  const colorMap: Record<string, string> = {
    'gold-100': 'bg-amber-50 border-amber-200',
    'primary-100': 'bg-purple-50 border-purple-200',
    'secondary-100': 'bg-pink-50 border-pink-200',
    'green-100': 'bg-emerald-50 border-emerald-200',
    'blue-100': 'bg-blue-50 border-blue-200',
    'amber-100': 'bg-orange-50 border-orange-200',
  };

  const bgClass = colorMap[color] || 'bg-gray-50 border-gray-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.18, duration: 0.5, ease: 'easeOut' }}
      className={`rounded-2xl border p-4 ${bgClass} shadow-sm`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{emoji}</span>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-800 text-sm mb-1">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{content}</p>
        </div>
      </div>
    </motion.div>
  );
}
