'use client';

import { cn } from '@/lib/utils';
import type { Element } from '@/types';

export interface RibbonBannerProps {
  children: React.ReactNode;
  element?: Element;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = {
  sm: 'text-xs py-1 px-4',
  md: 'text-sm py-1.5 px-6',
  lg: 'text-base py-2 px-8',
};

const BG: Record<Element, string> = {
  wood:  'bg-oheng-wood-500',
  fire:  'bg-oheng-fire-500',
  earth: 'bg-oheng-earth-500',
  metal: 'bg-oheng-metal-500',
  water: 'bg-oheng-water-500',
};

/**
 * RibbonBanner — 카드 하단 배너 스타일의 리본.
 * 등급/카드명 표시에 사용. clip-path로 리본 양끝 꼬리 모양 처리.
 */
export function RibbonBanner({ children, element, size = 'md', className }: RibbonBannerProps) {
  const bg = element ? BG[element] : 'bg-primary-500';
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-display text-white shadow-soft',
        bg,
        SIZE[size],
        className
      )}
      style={{
        clipPath:
          'polygon(14px 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0 50%)',
      }}
    >
      {children}
    </span>
  );
}
