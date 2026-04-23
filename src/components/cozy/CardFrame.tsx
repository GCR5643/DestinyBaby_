'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Element, Grade } from '@/types';
import { OhengBadge } from './OhengBadge';
import { GradeBadge } from './GradeBadge';
import { RibbonBanner } from './RibbonBanner';

/**
 * CardFrame — 카드 일러스트를 감싸는 액자 프레임.
 * PDF 카드 디자인을 CSS/SVG로 재현.
 *   - 木: 덩굴/꽃 프레임
 *   - 火: 불꽃 프레임
 *   - 土: 앤틱 액자 프레임
 *   - 金: 실버 프레임
 *   - 水: 물결 프레임
 *
 * 등급(N→SSS)에 따라 배경 그라디언트/프레임 정교함/파티클 증가.
 */

export interface CardFrameProps {
  element: Element;
  grade: Grade;
  title?: string;        // 시적 이름 (e.g. "동방청룡")
  profession?: string;   // 직업 라벨 (e.g. "화가")
  children: React.ReactNode;  // 카드 일러스트 또는 내용
  width?: number | string;
  height?: number | string;
  className?: string;
  onClick?: () => void;
}

const ELEMENT_HANZI: Record<Element, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};

const ELEMENT_BG_BY_GRADE: Record<Element, Record<Grade, string>> = {
  wood: {
    N:   'bg-oheng-wood-50',
    R:   'bg-gradient-to-br from-oheng-wood-50 to-oheng-wood-100',
    SR:  'bg-gradient-to-br from-oheng-wood-50 via-oheng-wood-100 to-purple-100',
    SSR: 'bg-gradient-to-br from-oheng-wood-100 via-oheng-wood-200 to-gold-200',
    UR:  'bg-gradient-to-br from-oheng-wood-200 via-pink-100 to-oheng-wood-300',
    SSS: 'bg-grade-sss',
  },
  fire: {
    N:   'bg-oheng-fire-50',
    R:   'bg-gradient-to-br from-oheng-fire-50 to-oheng-fire-100',
    SR:  'bg-gradient-to-br from-oheng-fire-100 via-oheng-fire-200 to-purple-100',
    SSR: 'bg-gradient-to-br from-oheng-fire-200 via-gold-200 to-oheng-fire-300',
    UR:  'bg-gradient-to-br from-oheng-fire-300 via-oheng-fire-500 to-oheng-fire-700',
    SSS: 'bg-grade-sss',
  },
  earth: {
    N:   'bg-oheng-earth-50',
    R:   'bg-gradient-to-br from-oheng-earth-50 to-oheng-earth-100',
    SR:  'bg-gradient-to-br from-oheng-earth-100 via-oheng-earth-200 to-purple-100',
    SSR: 'bg-gradient-to-br from-oheng-earth-200 via-gold-200 to-oheng-earth-300',
    UR:  'bg-gradient-to-br from-oheng-earth-300 via-oheng-fire-200 to-oheng-earth-500',
    SSS: 'bg-grade-sss',
  },
  metal: {
    N:   'bg-oheng-metal-50',
    R:   'bg-gradient-to-br from-oheng-metal-50 to-oheng-metal-100',
    SR:  'bg-gradient-to-br from-oheng-metal-100 via-oheng-metal-200 to-purple-100',
    SSR: 'bg-gradient-to-br from-oheng-metal-200 via-gold-200 to-oheng-metal-300',
    UR:  'bg-gradient-to-br from-oheng-metal-300 via-oheng-water-200 to-oheng-metal-500',
    SSS: 'bg-grade-sss',
  },
  water: {
    N:   'bg-oheng-water-50',
    R:   'bg-gradient-to-br from-oheng-water-50 to-oheng-water-100',
    SR:  'bg-gradient-to-br from-oheng-water-100 via-oheng-water-200 to-purple-100',
    SSR: 'bg-gradient-to-br from-oheng-water-200 via-gold-200 to-oheng-water-300',
    UR:  'bg-gradient-to-br from-oheng-water-300 via-purple-200 to-oheng-water-500',
    SSS: 'bg-grade-sss',
  },
};

const FRAME_BORDER_BY_ELEMENT: Record<Element, string> = {
  wood:  'border-oheng-wood-300',
  fire:  'border-oheng-fire-400',
  earth: 'border-oheng-earth-500',   // 골드 액자
  metal: 'border-oheng-metal-400',
  water: 'border-oheng-water-300',
};

const GRADE_GLOW: Record<Grade, string> = {
  N:   '',
  R:   'shadow-glow-r',
  SR:  'shadow-glow-sr',
  SSR: 'shadow-glow-ssr',
  UR:  'shadow-glow-ur',
  SSS: 'shadow-glow-sss',
};

/** SVG 장식 — 오행별 프레임 꾸밈 레이어 */
function ElementDecoration({ element, grade }: { element: Element; grade: Grade }) {
  const showDense = grade === 'SR' || grade === 'SSR' || grade === 'UR' || grade === 'SSS';
  if (element === 'wood') {
    return (
      <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 200 280" fill="none" aria-hidden>
        <path d="M10 40 Q20 20 40 30 T70 10" stroke="currentColor" strokeWidth="1.5" className="text-oheng-wood-500/60" />
        <circle cx="40" cy="30" r="4" className="fill-oheng-wood-300/80" />
        {showDense && (
          <>
            <circle cx="20" cy="200" r="3" className="fill-oheng-fire-300/50" />
            <circle cx="180" cy="60" r="3" className="fill-oheng-fire-300/50" />
          </>
        )}
      </svg>
    );
  }
  if (element === 'fire') {
    return (
      <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 200 280" fill="none" aria-hidden>
        <path d="M20 30 Q15 15 25 5 Q30 18 22 28 Z" className="fill-oheng-fire-400/70" />
        <path d="M180 250 Q175 235 185 225 Q190 238 182 248 Z" className="fill-oheng-fire-400/70" />
        {showDense && <path d="M100 270 L95 260 L105 260 Z" className="fill-oheng-fire-500/60" />}
      </svg>
    );
  }
  if (element === 'earth') {
    return (
      <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 200 280" fill="none" aria-hidden>
        <rect x="4" y="4" width="192" height="272" rx="16" stroke="currentColor" strokeWidth="2" className="text-oheng-earth-500/60" />
        <rect x="10" y="10" width="180" height="260" rx="12" stroke="currentColor" strokeWidth="1" className="text-oheng-earth-700/30" />
      </svg>
    );
  }
  if (element === 'metal') {
    return (
      <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 200 280" fill="none" aria-hidden>
        <path d="M8 8 L40 8 M160 8 L192 8 M8 272 L40 272 M160 272 L192 272" stroke="currentColor" strokeWidth="2" className="text-oheng-metal-500/60" />
      </svg>
    );
  }
  // water
  return (
    <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 200 280" fill="none" aria-hidden>
      <path d="M8 30 Q20 20 32 30 T56 30" stroke="currentColor" strokeWidth="1.5" className="text-oheng-water-400/60" />
      <path d="M144 250 Q156 240 168 250 T192 250" stroke="currentColor" strokeWidth="1.5" className="text-oheng-water-400/60" />
    </svg>
  );
}

export function CardFrame({
  element,
  grade,
  title,
  profession,
  children,
  width = 208,
  height = 295,
  className,
  onClick,
}: CardFrameProps) {
  const w = typeof width === 'number' ? `${width}px` : width;
  const h = typeof height === 'number' ? `${height}px` : height;
  return (
    <div
      data-oheng={element}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-card border-2',
        FRAME_BORDER_BY_ELEMENT[element],
        ELEMENT_BG_BY_GRADE[element][grade],
        GRADE_GLOW[grade],
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
      style={{ width: w, height: h }}
    >
      {/* 오행 한자 (좌상단) */}
      <div className="absolute top-2 left-2 z-20">
        <span
          className={cn(
            'font-display text-2xl leading-none',
            `text-oheng-${element}-500/80`
          )}
        >
          {ELEMENT_HANZI[element]}
        </span>
      </div>

      {/* 등급 배지 (우상단) */}
      <div className="absolute top-2 right-2 z-20">
        <GradeBadge grade={grade} size="sm" />
      </div>

      {/* 직업 라벨 (상단 중앙) */}
      {profession && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 text-[10px] font-medium text-gray-600 tracking-wide">
          — {profession} —
        </div>
      )}

      {/* 장식 레이어 */}
      <ElementDecoration element={element} grade={grade} />

      {/* 카드 본체 (일러스트/내용) */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        {children}
      </div>

      {/* 하단 리본 배너 */}
      {title && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
          <RibbonBanner element={element} size="sm">
            {title}
          </RibbonBanner>
        </div>
      )}
    </div>
  );
}
