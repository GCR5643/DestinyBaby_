'use client';

import { motion } from 'framer-motion';
import type { Card, Grade } from '@/types';
import { getGradeColor, getElementColor, getElementEmoji, cn } from '@/lib/utils';

const GRADE_LABELS: Record<Grade, string> = {
  N: '일반', R: '레어', SR: '슈퍼레어', SSR: '초레어', UR: '울트라레어', SSS: '신화',
};

interface CardDisplayProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  isFavorite?: boolean;
  onFavorite?: () => void;
  className?: string;
}

export default function CardDisplay({ card, size = 'md', showDetails = false, isFavorite, onFavorite, className }: CardDisplayProps) {
  const dimensions = {
    sm: 'w-24 h-[135px]',
    md: 'w-40 h-[228px]',
    lg: 'w-52 h-[295px]',
  };

  const isSSS = card.grade === 'SSS';
  const isUR = card.grade === 'UR';
  const isSSR = card.grade === 'SSR';
  const isSR = card.grade === 'SR';
  const isR = card.grade === 'R';

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 400 }}
      className={cn('relative', dimensions[size], 'rounded-2xl overflow-hidden shadow-lg', className)}
      style={{
        background: isSSS
          ? 'linear-gradient(135deg, #1a0a2e, #2d1b69, #6c5ce7)'
          : `linear-gradient(135deg, #1A0A2E, #2D1B69)`,
        boxShadow: isSSS
          ? '0 0 40px rgba(236, 72, 153, 0.6)'
          : isUR
          ? '0 0 30px rgba(239, 68, 68, 0.5)'
          : isSSR
          ? '0 0 25px rgba(245, 158, 11, 0.5)'
          : isSR
          ? '0 0 20px rgba(139, 92, 246, 0.4)'
          : isR
          ? '0 0 15px rgba(59, 130, 246, 0.3)'
          : undefined,
      }}
    >
      {/* Grade badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className="px-2 py-0.5 rounded-full text-white text-xs font-black"
          style={{ backgroundColor: isSSS ? '#F9CA24' : getGradeColor(card.grade), color: isSSS ? '#1A0A2E' : 'white' }}>
          {card.grade}
        </div>
      </div>

      {/* Element icon */}
      {card.element && (
        <div className="absolute top-2 left-2 z-10 text-lg">
          {getElementEmoji(card.element)}
        </div>
      )}

      {/* Card art area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-5xl opacity-30">✦</div>
      </div>

      {/* Card name */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white font-bold text-sm truncate">{card.name}</p>
        {size !== 'sm' && <p className="text-white/50 text-xs">{GRADE_LABELS[card.grade]}</p>}
      </div>

      {/* SSS rainbow border effect */}
      {isSSS && (
        <div className="absolute inset-0 rounded-2xl"
          style={{ background: 'linear-gradient(45deg, #f093fb, #f5576c, #4facfe, #f9ca24, #f093fb)', padding: '2px' }}>
          <div className="w-full h-full rounded-2xl" style={{ background: 'linear-gradient(135deg, #1a0a2e, #2d1b69)' }} />
        </div>
      )}

      {/* Favorite button */}
      {onFavorite && (
        <button onClick={onFavorite} className="absolute bottom-2 right-2 z-10 text-xl">
          {isFavorite ? '❤️' : '🤍'}
        </button>
      )}
    </motion.div>
  );
}
