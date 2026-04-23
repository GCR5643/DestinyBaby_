'use client';

import { motion } from 'framer-motion';
import type { Card } from '@/types';
import { getElementEmoji } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { CardFrame } from '@/components/cozy';

interface CardDisplayProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  isFavorite?: boolean;
  onFavorite?: () => void;
  className?: string;
}

export default function CardDisplay({ card, size = 'md', showDetails = false, isFavorite, onFavorite, className }: CardDisplayProps) {
  // sm: 96×135, md: 160×228, lg: 208×295
  const dimensions: Record<'sm' | 'md' | 'lg', { w: number; h: number }> = {
    sm: { w: 96,  h: 135 },
    md: { w: 160, h: 228 },
    lg: { w: 208, h: 295 },
  };

  const { w, h } = dimensions[size];
  const element = card.element ?? 'earth';

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 400 }}
      className={cn('relative flex-shrink-0', className)}
    >
      <CardFrame
        element={element}
        grade={card.grade}
        title={size !== 'sm' ? card.name : undefined}
        width={w}
        height={h}
      >
        {/* 카드 일러스트 — imageUrl 있으면 이미지, 없으면 치비 실루엣 플레이스홀더 */}
        {card.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.image_url}
            alt={card.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 select-none">
            <div
              className="rounded-full bg-white/50 flex items-center justify-center shadow-soft"
              style={{ width: w * 0.45, height: w * 0.45 }}
            >
              <span style={{ fontSize: w * 0.18 }}>{getElementEmoji(element)}</span>
            </div>
            {size === 'sm' && (
              <p className="text-[9px] font-bold text-gray-600 truncate max-w-[80px] text-center">
                {card.name}
              </p>
            )}
          </div>
        )}
      </CardFrame>

      {/* 즐겨찾기 버튼 */}
      {onFavorite && (
        <button
          onClick={onFavorite}
          className="absolute bottom-2 right-2 z-30 text-xl"
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      )}
    </motion.div>
  );
}
