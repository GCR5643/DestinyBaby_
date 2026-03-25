'use client';

import type { Grade } from '@/types';

const GRADE_BORDER_COLOR: Record<Grade, string> = {
  N: 'rgba(149,165,166,0.4)',
  R: 'rgba(59,130,246,0.6)',
  SR: 'rgba(139,92,246,0.7)',
  SSR: 'rgba(245,158,11,0.8)',
  UR: 'rgba(239,68,68,0.9)',
  SSS: 'transparent',
};

// 별자리 패턴 SVG — 간단한 점 배열
const STAR_POSITIONS = [
  { x: 15, y: 12 }, { x: 78, y: 20 }, { x: 42, y: 8 },
  { x: 88, y: 55 }, { x: 10, y: 65 }, { x: 55, y: 30 },
  { x: 25, y: 80 }, { x: 70, y: 85 }, { x: 92, y: 30 },
  { x: 38, y: 92 }, { x: 60, y: 70 }, { x: 18, y: 45 },
  { x: 82, y: 42 }, { x: 48, y: 55 }, { x: 33, y: 35 },
];

interface CardBackProps {
  grade: Grade;
  width?: number;
  height?: number;
}

export default function CardBack({ grade, width = 208, height = 295 }: CardBackProps) {
  const isSSS = grade === 'SSS';
  const borderColor = GRADE_BORDER_COLOR[grade];

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex-shrink-0"
      style={{
        width,
        height,
        background: 'linear-gradient(135deg, #0D0720 0%, #1A0A2E 40%, #2D1B69 100%)',
        border: isSSS
          ? '2px solid transparent'
          : `2px solid ${borderColor}`,
        backgroundClip: isSSS ? undefined : undefined,
        boxShadow: isSSS
          ? '0 0 0 2px transparent'
          : undefined,
        // SSS rainbow border via outline trick
        outline: isSSS ? 'none' : undefined,
      }}
    >
      {/* SSS rainbow border */}
      {isSSS && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-10"
          style={{
            background: 'linear-gradient(45deg,#f093fb,#f5576c,#4facfe,#f9ca24,#f093fb)',
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      )}

      {/* 별자리 배경 패턴 */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {STAR_POSITIONS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={i % 3 === 0 ? 0.8 : 0.5}
            fill="white"
            opacity={0.25 + (i % 4) * 0.1}
          />
        ))}
        {/* 별자리 연결선 */}
        <line x1="15" y1="12" x2="42" y2="8" stroke="white" strokeWidth="0.2" opacity="0.1" />
        <line x1="42" y1="8" x2="78" y2="20" stroke="white" strokeWidth="0.2" opacity="0.1" />
        <line x1="55" y1="30" x2="88" y2="55" stroke="white" strokeWidth="0.2" opacity="0.1" />
        <line x1="10" y1="65" x2="25" y2="80" stroke="white" strokeWidth="0.2" opacity="0.1" />
        <line x1="60" y1="70" x2="70" y2="85" stroke="white" strokeWidth="0.2" opacity="0.1" />
      </svg>

      {/* 내부 테두리 광선 */}
      <div
        className="absolute inset-3 rounded-xl pointer-events-none"
        style={{ border: `1px solid ${isSSS ? 'rgba(249,202,36,0.3)' : 'rgba(255,255,255,0.1)'}` }}
      />

      {/* 중앙 운명 심볼 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none">
        {/* 메인 심볼 */}
        <div
          className="text-5xl"
          style={{
            opacity: 0.7,
            filter: isSSS
              ? 'drop-shadow(0 0 12px rgba(249,202,36,0.9))'
              : grade === 'UR'
              ? 'drop-shadow(0 0 10px rgba(239,68,68,0.8))'
              : grade === 'SSR'
              ? 'drop-shadow(0 0 8px rgba(245,158,11,0.7))'
              : 'drop-shadow(0 0 6px rgba(108,92,231,0.6))',
          }}
        >
          ✦
        </div>
        {/* 운명 한자 */}
        <div
          className="text-sm font-bold tracking-widest"
          style={{
            color: isSSS
              ? 'rgba(249,202,36,0.8)'
              : grade === 'UR'
              ? 'rgba(239,68,68,0.7)'
              : 'rgba(162,155,254,0.6)',
            textShadow: '0 0 8px currentColor',
          }}
        >
          運命
        </div>
      </div>

      {/* 상단 빛 효과 */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full pointer-events-none"
        style={{
          background: isSSS
            ? 'linear-gradient(90deg,transparent,rgba(249,202,36,0.6),transparent)'
            : `linear-gradient(90deg,transparent,${borderColor},transparent)`,
        }}
      />
    </div>
  );
}
