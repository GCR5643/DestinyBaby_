'use client';

/**
 * 한국 전통 복주머니 SVG 컴포넌트
 * - 비단 복주머니 형태 (타원형 몸체 + 주름진 목 + 매듭)
 * - 앱 테마: primary purple (#6C5CE7) + gold (#F9CA24) + secondary pink (#FFB8C6)
 */
export default function KoreanLuckyBag({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 158"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="복주머니"
    >
      <defs>
        {/* 몸체 그라디언트 - 앱 primary purple */}
        <linearGradient id="klb-body" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#b2a4ff" />
          <stop offset="45%" stopColor="#6C5CE7" />
          <stop offset="100%" stopColor="#3f2ca3" />
        </linearGradient>

        {/* 골드 그라디언트 */}
        <linearGradient id="klb-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe566" />
          <stop offset="100%" stopColor="#f0932b" />
        </linearGradient>

        {/* 목 그라디언트 */}
        <linearGradient id="klb-neck" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5248b8" />
          <stop offset="100%" stopColor="#7b6ff0" />
        </linearGradient>

        {/* 하이라이트 빛반사 */}
        <radialGradient id="klb-shine" cx="32%" cy="28%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* 아래쪽 음영 */}
        <radialGradient id="klb-shadow" cx="50%" cy="95%" r="50%">
          <stop offset="0%" stopColor="rgba(30,10,80,0.35)" />
          <stop offset="100%" stopColor="rgba(30,10,80,0)" />
        </radialGradient>

        {/* 드롭 섀도우 필터 */}
        <filter id="klb-drop" x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#3f2ca3" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ── 술 (tassel tip) ── */}
      <ellipse cx="50" cy="5" rx="3.5" ry="5.5" fill="url(#klb-gold)" />

      {/* 술 실 3가닥 */}
      <line x1="47.5" y1="9"  x2="44"  y2="21" stroke="#F9CA24"  strokeWidth="1.4" strokeLinecap="round" />
      <line x1="50"   y1="10" x2="50"  y2="21" stroke="#ffe566"  strokeWidth="1.4" strokeLinecap="round" />
      <line x1="52.5" y1="9"  x2="56"  y2="21" stroke="#F9CA24"  strokeWidth="1.4" strokeLinecap="round" />

      {/* ── 매듭 (Korean decorative flower knot) ── */}
      {/* 상 */}
      <ellipse cx="50"   cy="23.5" rx="5"   ry="8.5" fill="#d4820a" />
      <ellipse cx="50"   cy="23.5" rx="3.8" ry="7"   fill="url(#klb-gold)" />
      {/* 좌 */}
      <ellipse cx="41.5" cy="31"   rx="8.5" ry="5"   fill="#d4820a" />
      <ellipse cx="41.5" cy="31"   rx="7"   ry="3.8" fill="url(#klb-gold)" />
      {/* 우 */}
      <ellipse cx="58.5" cy="31"   rx="8.5" ry="5"   fill="#d4820a" />
      <ellipse cx="58.5" cy="31"   rx="7"   ry="3.8" fill="url(#klb-gold)" />
      {/* 하 */}
      <ellipse cx="50"   cy="38.5" rx="5"   ry="8.5" fill="#d4820a" />
      <ellipse cx="50"   cy="38.5" rx="3.8" ry="7"   fill="url(#klb-gold)" />
      {/* 중앙 원 */}
      <circle cx="50" cy="31" r="8"   fill="#d4820a" />
      <circle cx="50" cy="31" r="6"   fill="url(#klb-gold)" />
      <circle cx="50" cy="31" r="2.8" fill="rgba(255,255,255,0.72)" />

      {/* 매듭 아래 연결부 */}
      <path d="M45,44 Q50,47 55,44 L54,51 Q50,53 46,51Z" fill="#d4820a" />
      <path d="M46,45 Q50,48 54,45 L53,50 Q50,52 47,50Z" fill="#F9CA24" />

      {/* ── 목 (gathered neck) ── */}
      <path
        d="M44,51 Q38,57 37,67 L63,67 Q62,57 56,51 Q50,55 44,51Z"
        fill="url(#klb-neck)"
      />
      {/* 주름선 3개 */}
      <path d="M45,52 Q44,59 44,67" stroke="rgba(255,255,255,0.13)" strokeWidth="1" fill="none" />
      <path d="M50,53 L50,67"         stroke="rgba(255,255,255,0.17)" strokeWidth="1" fill="none" />
      <path d="M55,52 Q56,59 56,67" stroke="rgba(255,255,255,0.13)" strokeWidth="1" fill="none" />

      {/* 금색 깃 (collar trim) */}
      <path
        d="M37,67 Q50,74.5 63,67"
        stroke="url(#klb-gold)"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── 몸체 (pouch body) ── */}
      {/* 드롭 섀도우 */}
      <ellipse cx="52" cy="114" rx="40" ry="44" fill="rgba(50,20,100,0.28)" />
      {/* 메인 몸체 */}
      <ellipse cx="50" cy="111" rx="40" ry="44" fill="url(#klb-body)" filter="url(#klb-drop)" />
      {/* 아래 음영 */}
      <ellipse cx="50" cy="111" rx="40" ry="44" fill="url(#klb-shadow)" />
      {/* 광택 하이라이트 */}
      <ellipse cx="50" cy="111" rx="40" ry="44" fill="url(#klb-shine)" />

      {/* 비단 주름선 (fabric texture) */}
      <path d="M14,100 Q50,93  86,100" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" fill="none" />
      <path d="M11,115 Q50,107 89,115" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" fill="none" />
      <path d="M13,130 Q50,123 87,130" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" fill="none" />

      {/* ── 복(福) 글자 ── */}
      <text
        x="50"
        y="120"
        textAnchor="middle"
        fontSize="40"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="bold"
        fill="rgba(255,255,255,0.90)"
        letterSpacing="-1"
      >
        복
      </text>

      {/* 골드 스파클 장식 */}
      <circle cx="26" cy="100" r="2.2" fill="#F9CA24" opacity="0.55" />
      <circle cx="74" cy="100" r="2.2" fill="#F9CA24" opacity="0.55" />
      <circle cx="21" cy="116" r="1.6" fill="#FFB8C6" opacity="0.65" />
      <circle cx="79" cy="116" r="1.6" fill="#FFB8C6" opacity="0.65" />
      <circle cx="33"  cy="88"  r="1.5" fill="#FFB8C6" opacity="0.45" />
      <circle cx="67"  cy="88"  r="1.5" fill="#FFB8C6" opacity="0.45" />

      {/* 작은 별 모양 (좌상단) */}
      <g transform="translate(30,92)" opacity="0.5">
        <line x1="0" y1="-4" x2="0"  y2="4"  stroke="#F9CA24" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-4" y1="0" x2="4" y2="0"  stroke="#F9CA24" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-3" y1="-3" x2="3" y2="3" stroke="#F9CA24" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="3" y1="-3" x2="-3" y2="3" stroke="#F9CA24" strokeWidth="0.8" strokeLinecap="round" />
      </g>
      {/* 작은 별 모양 (우상단) */}
      <g transform="translate(70,92)" opacity="0.5">
        <line x1="0" y1="-4" x2="0"  y2="4"  stroke="#F9CA24" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-4" y1="0" x2="4" y2="0"  stroke="#F9CA24" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-3" y1="-3" x2="3" y2="3" stroke="#F9CA24" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="3" y1="-3" x2="-3" y2="3" stroke="#F9CA24" strokeWidth="0.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}
