'use client';

import { cn } from '@/lib/utils';
import type { Grade } from '@/types';

const GRADE_LABELS: Record<Grade, string> = {
  N: '일반',
  R: '레어',
  SR: '슈퍼레어',
  SSR: '초레어',
  UR: '울트라',
  SSS: '신화',
};

const GRADE_BG: Record<Grade, string> = {
  N:   'bg-[var(--grade-n)]',
  R:   'bg-[var(--grade-r)]',
  SR:  'bg-[var(--grade-sr)]',
  SSR: 'bg-[var(--grade-ssr)]',
  UR:  'bg-[var(--grade-ur)]',
  SSS: 'bg-grade-sss',
};

const GRADE_GLOW: Record<Grade, string> = {
  N:   '',
  R:   'shadow-glow-r',
  SR:  'shadow-glow-sr',
  SSR: 'shadow-glow-ssr',
  UR:  'shadow-glow-ur',
  SSS: 'shadow-glow-sss',
};

export interface GradeBadgeProps {
  grade: Grade;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function GradeBadge({ grade, size = 'md', showLabel = false, className }: GradeBadgeProps) {
  const sizeCls = {
    sm: 'h-6 min-w-6 text-[10px] px-1.5',
    md: 'h-8 min-w-8 text-xs px-2',
    lg: 'h-10 min-w-10 text-sm px-2.5',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-display font-bold text-white',
        'border-2 border-white/80 shadow-soft',
        GRADE_BG[grade],
        GRADE_GLOW[grade],
        sizeCls,
        className
      )}
      aria-label={`${grade} 등급 ${GRADE_LABELS[grade]}`}
    >
      {grade}
      {showLabel && <span className="ml-1 font-sans font-medium opacity-90">{GRADE_LABELS[grade]}</span>}
    </span>
  );
}

export function getGradeTitle(grade: Grade): string {
  return GRADE_LABELS[grade];
}
