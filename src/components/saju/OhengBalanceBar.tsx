'use client';

import { motion } from 'framer-motion';
import type { OhengElements } from './OhengRadarChart';

// ─── 상수 ───────────────────────────────────────────────────────────────────

// oheng 팔레트 500 토큰 값 (tailwind.config.ts 기준)
const ELEMENTS = [
  { key: 'wood'  as const, label: '木', korean: '목', color: '#5FA64A' },
  { key: 'fire'  as const, label: '火', korean: '화', color: '#E05A7A' },
  { key: 'earth' as const, label: '土', korean: '토', color: '#B88B3E' },
  { key: 'metal' as const, label: '金', korean: '금', color: '#6C7E94' },
  { key: 'water' as const, label: '水', korean: '수', color: '#4A5FA8' },
] as const;

// 과다 >= 3, 부족 <= 0, 나머지 적정
function getStatus(val: number, total: number): '과다' | '적정' | '부족' {
  const avg = total / 5;
  if (val >= avg * 1.6 || val >= 3) return '과다';
  if (val === 0) return '부족';
  return '적정';
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface OhengBalanceBarProps {
  elements: OhengElements;
  animated?: boolean;
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────

export default function OhengBalanceBar({ elements, animated = true }: OhengBalanceBarProps) {
  const total = ELEMENTS.reduce((sum, el) => sum + elements[el.key], 0);
  const safeTotal = total === 0 ? 1 : total;

  const excess  = ELEMENTS.filter(el => getStatus(elements[el.key], total) === '과다').map(el => el.korean);
  const lacking = ELEMENTS.filter(el => getStatus(elements[el.key], total) === '부족').map(el => el.korean);

  return (
    <div className="w-full space-y-2">
      {/* 가로 비율 바 */}
      <div className="flex h-6 w-full overflow-hidden rounded-full shadow-inner bg-gray-100">
        {ELEMENTS.map((el, i) => {
          const ratio = (elements[el.key] / safeTotal) * 100;
          if (ratio === 0) return null;
          return animated ? (
            <motion.div
              key={el.key}
              initial={{ width: 0 }}
              animate={{ width: `${ratio}%` }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
              style={{ backgroundColor: el.color }}
              className="h-full flex items-center justify-center"
              title={`${el.korean}: ${elements[el.key]}`}
            >
              {ratio >= 12 && (
                <span className="text-white text-[10px] font-bold drop-shadow">{el.label}</span>
              )}
            </motion.div>
          ) : (
            <div
              key={el.key}
              style={{ backgroundColor: el.color, width: `${ratio}%` }}
              className="h-full flex items-center justify-center"
              title={`${el.korean}: ${elements[el.key]}`}
            >
              {ratio >= 12 && (
                <span className="text-white text-[10px] font-bold drop-shadow">{el.label}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {ELEMENTS.map(el => (
          <div key={el.key} className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: el.color }}
            />
            <span className="text-xs text-gray-600">
              {el.korean}({elements[el.key]})
            </span>
          </div>
        ))}
      </div>

      {/* 상태 요약 */}
      {(excess.length > 0 || lacking.length > 0) && (
        <div className="text-xs text-gray-500 space-y-0.5">
          {excess.length > 0 && (
            <p>
              <span className="text-red-500 font-semibold">과다</span>: {excess.join(', ')}
            </p>
          )}
          {lacking.length > 0 && (
            <p>
              <span className="text-blue-500 font-semibold">부족</span>: {lacking.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
