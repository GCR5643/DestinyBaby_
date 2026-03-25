'use client';

import { motion } from 'framer-motion';

// ─── 타입 ───────────────────────────────────────────────────────────────────

export interface OhengElements {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface OhengRadarChartProps {
  elements: OhengElements;
  size?: number;
  showLabels?: boolean;
  animated?: boolean;
}

// ─── 상수 ───────────────────────────────────────────────────────────────────

const MAX_VALUE = 5;

// 오각형: 위쪽(木)부터 시계방향 — 木, 火, 土, 金, 水
const AXES = [
  { key: 'wood'  as const, label: '木', korean: '목', color: '#22C55E', emoji: '🌿' },
  { key: 'fire'  as const, label: '火', korean: '화', color: '#EF4444', emoji: '🔥' },
  { key: 'earth' as const, label: '土', korean: '토', color: '#EAB308', emoji: '🌍' },
  { key: 'metal' as const, label: '金', korean: '금', color: '#F8FAFC', emoji: '⚡' },
  { key: 'water' as const, label: '水', korean: '수', color: '#3B82F6', emoji: '💧' },
];

// 5각형 꼭짓점 각도 계산 (위쪽이 -90도 = 12시 방향)
function getPoint(index: number, radius: number, cx: number, cy: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function pointsToPath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z';
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────

export default function OhengRadarChart({
  elements,
  size = 280,
  showLabels = true,
  animated = true,
}: OhengRadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  // 라벨 공간 확보를 위해 차트 반경은 size의 35%
  const maxRadius = size * 0.35;
  const levels = MAX_VALUE; // 격자 레벨 수

  // 격자 오각형
  const gridPolygons = Array.from({ length: levels }, (_, i) => {
    const r = (maxRadius * (i + 1)) / levels;
    const pts = AXES.map((_, axIdx) => getPoint(axIdx, r, cx, cy));
    return pointsToPath(pts);
  });

  // 데이터 폴리곤
  const dataPoints = AXES.map((ax, i) => {
    const val = Math.min(Math.max(elements[ax.key], 0), MAX_VALUE);
    const r = (maxRadius * val) / MAX_VALUE;
    return getPoint(i, r, cx, cy);
  });
  const dataPath = pointsToPath(dataPoints);

  // 라벨 위치 (꼭짓점 바깥)
  const labelRadius = maxRadius + size * 0.14;
  const labelPoints = AXES.map((_, i) => getPoint(i, labelRadius, cx, cy));

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label="오행 레이더 차트"
      >
        {/* 배경 격자 오각형 */}
        {gridPolygons.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={i === levels - 1 ? 1.5 : 0.8}
            strokeDasharray={i === levels - 1 ? undefined : '3 3'}
          />
        ))}

        {/* 축선 (중심 → 꼭짓점) */}
        {AXES.map((_, i) => {
          const outer = getPoint(i, maxRadius, cx, cy);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="#E5E7EB"
              strokeWidth={0.8}
            />
          );
        })}

        {/* 데이터 채우기 영역 (애니메이션 지원) */}
        {animated ? (
          <motion.path
            d={dataPath}
            fill="rgba(108, 92, 231, 0.18)"
            stroke="#6C5CE7"
            strokeWidth={2}
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ) : (
          <path
            d={dataPath}
            fill="rgba(108, 92, 231, 0.18)"
            stroke="#6C5CE7"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        )}

        {/* 데이터 포인트 (각 꼭짓점의 점) */}
        {dataPoints.map((pt, i) => {
          const val = elements[AXES[i].key];
          if (val === 0) return null;
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill={AXES[i].color}
              stroke="#fff"
              strokeWidth={1.5}
            />
          );
        })}

        {/* 라벨 (showLabels=true일 때) */}
        {showLabels && labelPoints.map((pt, i) => {
          const ax = AXES[i];
          const val = elements[ax.key];
          return (
            <g key={i}>
              {/* 오행 한자 */}
              <text
                x={pt.x}
                y={pt.y - 8}
                textAnchor="middle"
                dominantBaseline="auto"
                fontSize={size * 0.07}
                fontWeight="700"
                fill={ax.color === '#F8FAFC' ? '#94A3B8' : ax.color}
              >
                {ax.label}
              </text>
              {/* 한글 이름 + 개수 */}
              <text
                x={pt.x}
                y={pt.y + 10}
                textAnchor="middle"
                dominantBaseline="auto"
                fontSize={size * 0.05}
                fill="#6B7280"
              >
                {ax.korean} {val}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
