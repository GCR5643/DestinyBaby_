'use client';

import type { Grade } from '@/types';

// 등급별 테두리 색상 — 파스텔 팔레트
const GRADE_BORDER_COLOR: Record<Grade, string> = {
  N:   'rgba(184,188,197,0.5)',
  R:   'rgba(94,140,232,0.55)',
  SR:  'rgba(176,125,229,0.65)',
  SSR: 'rgba(244,197,66,0.75)',
  UR:  'rgba(233,74,110,0.85)',
  SSS: 'transparent',
};

// 등급별 배경 그라디언트 — 밝은 파스텔
const GRADE_BG: Record<Grade, string> = {
  N:   'linear-gradient(135deg, #f8f5ff 0%, #f0effe 100%)',
  R:   'linear-gradient(135deg, #eef2fc 0%, #e4e1fd 100%)',
  SR:  'linear-gradient(135deg, #f5f0ff 0%, #ede8ff 100%)',
  SSR: 'linear-gradient(135deg, #fffde8 0%, #fff3c2 100%)',
  UR:  'linear-gradient(135deg, #fff0f3 0%, #ffd6dd 100%)',
  SSS: 'conic-gradient(from 180deg at 50% 50%, #ffb8c6, #b0a7f8, #8fd47b, #f4c542, #ff8fa8, #ffb8c6)',
};

// 오행 심볼 패턴 SVG — 꽃별/구름 도트 배열
const DOT_POSITIONS = [
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
        background: GRADE_BG[grade],
        border: isSSS ? '2px solid transparent' : `2px solid ${borderColor}`,
      }}
    >
      {/* SSS 무지개 테두리 */}
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

      {/* 소프트 도트 패턴 배경 */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {DOT_POSITIONS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={i % 3 === 0 ? 1.0 : 0.6}
            fill={isSSS ? '#f093fb' : '#6C5CE7'}
            opacity={0.12 + (i % 4) * 0.06}
          />
        ))}
        {/* 부드러운 연결선 */}
        <line x1="15" y1="12" x2="42" y2="8"  stroke="#6C5CE7" strokeWidth="0.25" opacity="0.08" />
        <line x1="42" y1="8"  x2="78" y2="20" stroke="#6C5CE7" strokeWidth="0.25" opacity="0.08" />
        <line x1="55" y1="30" x2="88" y2="55" stroke="#6C5CE7" strokeWidth="0.25" opacity="0.08" />
        <line x1="10" y1="65" x2="25" y2="80" stroke="#6C5CE7" strokeWidth="0.25" opacity="0.08" />
        <line x1="60" y1="70" x2="70" y2="85" stroke="#6C5CE7" strokeWidth="0.25" opacity="0.08" />
      </svg>

      {/* 내부 테두리 광선 */}
      <div
        className="absolute inset-3 rounded-xl pointer-events-none"
        style={{ border: `1px solid ${isSSS ? 'rgba(249,202,36,0.4)' : 'rgba(108,92,231,0.15)'}` }}
      />

      {/* 중앙 운명 심볼 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none">
        {/* 메인 심볼 */}
        <div
          className="text-5xl"
          style={{
            opacity: 0.55,
            filter: isSSS
              ? 'drop-shadow(0 0 10px rgba(249,202,36,0.8))'
              : grade === 'UR'
              ? 'drop-shadow(0 0 8px rgba(233,74,110,0.6))'
              : grade === 'SSR'
              ? 'drop-shadow(0 0 7px rgba(244,197,66,0.6))'
              : 'drop-shadow(0 0 5px rgba(108,92,231,0.4))',
          }}
        >
          ✦
        </div>
        {/* 운명 한자 */}
        <div
          className="text-sm font-bold tracking-widest"
          style={{
            color: isSSS
              ? 'rgba(200,133,0,0.75)'
              : grade === 'UR'
              ? 'rgba(200,50,80,0.65)'
              : 'rgba(108,92,231,0.55)',
            textShadow: '0 1px 4px rgba(255,255,255,0.8)',
          }}
        >
          運命
        </div>
      </div>

      {/* 상단 빛 줄기 */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full pointer-events-none"
        style={{
          background: isSSS
            ? 'linear-gradient(90deg,transparent,rgba(249,202,36,0.5),transparent)'
            : `linear-gradient(90deg,transparent,${borderColor},transparent)`,
        }}
      />
    </div>
  );
}
