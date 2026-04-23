'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Element } from '@/types';

export interface CozyPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  element?: Element;
  tone?: 'white' | 'pastel';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  title?: string;
  subtitle?: string;
}

const PAD = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

/**
 * CozyPanel — 카드 세계관의 액자형 패널.
 * 오행을 props로 주면 테두리/배경이 해당 오행 색조로 바뀜.
 */
export function CozyPanel({
  element,
  tone = 'white',
  padding = 'md',
  hover = false,
  title,
  subtitle,
  className,
  children,
  ...rest
}: CozyPanelProps) {
  const borderColor = element ? `border-oheng-${element}-200` : 'border-primary-100';
  const bg = tone === 'pastel' && element ? `bg-oheng-${element}-50` : 'bg-white';

  return (
    <div
      className={cn(
        'relative rounded-card border shadow-soft',
        borderColor,
        bg,
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg',
        PAD[padding],
        className
      )}
      data-oheng={element}
      {...rest}
    >
      {(title || subtitle) && (
        <header className="mb-3">
          {title && <h3 className="font-display text-lg text-gray-800">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </header>
      )}
      {children}
    </div>
  );
}
