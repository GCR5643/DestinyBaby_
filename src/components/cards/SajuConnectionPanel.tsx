'use client';

import { motion } from 'framer-motion';
import type { CardSajuExplanation, Element } from '@/types';

const ELEMENT_COLOR: Record<Element, string> = {
  wood: '#22c55e',
  fire: '#ef4444',
  earth: '#f59e0b',
  metal: '#a8a29e',
  water: '#3b82f6',
};

const ELEMENT_EMOJI: Record<Element, string> = {
  wood: '🌿',
  fire: '🔥',
  earth: '🌍',
  metal: '⚔️',
  water: '💧',
};

const ELEMENT_KOREAN: Record<Element, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

interface SajuConnectionPanelProps {
  explanation: CardSajuExplanation;
  cardElement?: Element;
  onClose: () => void;
}

export default function SajuConnectionPanel({
  explanation,
  cardElement,
  onClose,
}: SajuConnectionPanelProps) {
  const el = cardElement ?? 'fire';
  const elColor = ELEMENT_COLOR[el];
  const elEmoji = ELEMENT_EMOJI[el];
  const elKr = ELEMENT_KOREAN[el];

  // 확률 바 너비 — probabilityBoost는 0~20 범위이므로 최대 100% 매핑
  const safeProbabilityBoost = Math.max(0, explanation.probabilityBoost);
  const barPercent = Math.min(100, (safeProbabilityBoost / 20) * 100);

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(29,16,56,0.97) 0%, rgba(45,27,105,0.97) 100%)',
        border: '1px solid rgba(162,155,254,0.25)',
        boxShadow: '0 -8px 40px rgba(108,92,231,0.3)',
      }}
    >
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{elEmoji}</span>
          <h3 className="text-white font-black text-base">이 카드가 나온 이유</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white/80 transition-colors text-xl leading-none"
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      {/* 구분선 */}
      <div className="mx-5 mb-4" style={{ height: '1px', background: 'rgba(162,155,254,0.15)' }} />

      {/* 내용 */}
      <div className="px-5 pb-5 space-y-3">
        {/* 헤드라인 */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: `rgba(${hexToRgb(elColor)}, 0.12)`, border: `1px solid rgba(${hexToRgb(elColor)}, 0.25)` }}
        >
          <span className="text-lg">{elEmoji}</span>
          <p className="text-white/90 text-sm font-semibold">{explanation.headline}</p>
        </div>

        {/* 사주 연결 이유 */}
        <div className="flex items-start gap-2">
          <span className="text-base flex-shrink-0 mt-0.5">📍</span>
          <p className="text-white/75 text-sm leading-relaxed">{explanation.sajuConnection}</p>
        </div>

        {/* 오행 부스트 설명 */}
        <div className="flex items-start gap-2">
          <span className="text-base flex-shrink-0 mt-0.5">✨</span>
          <p className="text-white/75 text-sm leading-relaxed">{explanation.elementBoost}</p>
        </div>

        {/* 확률 상승 바 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📈</span>
              <span className="text-white/60 text-xs">{elKr} 카드 출현 확률 상승</span>
            </div>
            <span className="text-xs font-bold" style={{ color: elColor }}>
              +{safeProbabilityBoost}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${elColor}, ${lighten(elColor)})` }}
              initial={{ width: '0%' }}
              animate={{ width: `${barPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>

        {/* 커리어 힌트 */}
        <div
          className="flex items-start gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <span className="text-base flex-shrink-0">💡</span>
          <p className="text-white/60 text-xs leading-relaxed">{explanation.careerHint}</p>
        </div>
      </div>

      {/* 확인 버튼 */}
      <div className="px-5 pb-5">
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-bold text-sm transition-opacity active:opacity-70"
          style={{
            background: `linear-gradient(135deg, rgba(${hexToRgb(elColor)},0.6), rgba(108,92,231,0.8))`,
            color: 'white',
          }}
        >
          확인
        </button>
      </div>
    </motion.div>
  );
}

/** hex → "r,g,b" 변환 헬퍼 */
function hexToRgb(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

/** 색상을 약간 밝게 */
function lighten(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = Math.min(255, parseInt(cleaned.slice(0, 2), 16) + 60);
  const g = Math.min(255, parseInt(cleaned.slice(2, 4), 16) + 60);
  const b = Math.min(255, parseInt(cleaned.slice(4, 6), 16) + 60);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
