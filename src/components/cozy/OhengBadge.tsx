'use client';

import { cn } from '@/lib/utils';
import type { Element } from '@/types';

const OHENG_HANZI: Record<Element, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

const OHENG_LABEL: Record<Element, string> = {
  wood: '나무',
  fire: '불',
  earth: '흙',
  metal: '쇠',
  water: '물',
};

const OHENG_BG: Record<Element, string> = {
  wood:  'bg-oheng-wood-500',
  fire:  'bg-oheng-fire-500',
  earth: 'bg-oheng-earth-500',
  metal: 'bg-oheng-metal-500',
  water: 'bg-oheng-water-500',
};

export interface OhengBadgeProps {
  element: Element;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'soft';
  className?: string;
}

export function OhengBadge({ element, size = 'md', variant = 'solid', className }: OhengBadgeProps) {
  const sizeCls = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-lg',
  }[size];

  const styleCls =
    variant === 'solid'
      ? cn('text-white', OHENG_BG[element])
      : cn(
          `bg-oheng-${element}-50 text-oheng-${element}-700 border border-oheng-${element}-300`
        );

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-display font-bold shadow-soft',
        styleCls,
        sizeCls,
        className
      )}
      aria-label={`오행: ${OHENG_LABEL[element]}`}
    >
      {OHENG_HANZI[element]}
    </span>
  );
}

export function getOhengHanzi(element: Element): string {
  return OHENG_HANZI[element];
}

export function getOhengLabel(element: Element): string {
  return OHENG_LABEL[element];
}
