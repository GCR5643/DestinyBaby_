'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card, CardSajuExplanation, Element } from '@/types';
import { getElementEmoji } from '@/lib/utils';
import { cn } from '@/lib/utils';
import CardBackComponent from './CardBack';
import SajuConnectionPanel from './SajuConnectionPanel';
import { CardFrame } from '@/components/cozy';


// ─── 카드 뒷면 (CardBack 컴포넌트 래퍼) ────────────────────────────────────

function CardBack({ onClick, grade }: { onClick: () => void; grade: string }) {
  return (
    <motion.div
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer select-none"
    >
      <CardBackComponent grade={grade as import('@/types').Grade} width={208} height={295} />
    </motion.div>
  );
}

// ─── 카드 앞면 — CardFrame 기반 파스텔 디자인 ────────────────────────────

function CardFront({ card }: { card: Card }) {
  // element가 없으면 earth 기본값 사용
  const element = card.element ?? 'earth';

  return (
    <CardFrame
      element={element}
      grade={card.grade}
      title={card.name}
      width={208}
      height={295}
    >
      {/* 카드 일러스트 — imageUrl 있으면 이미지, 없으면 치비 실루엣 플레이스홀더 */}
      {card.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image_url}
          alt={card.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 select-none">
          <div className="w-24 h-24 rounded-full bg-white/50 flex items-center justify-center shadow-soft">
            <span className="text-4xl">{getElementEmoji(element)}</span>
          </div>
        </div>
      )}
    </CardFrame>
  );
}

// ─── 등급별 파티클 효과 ────────────────────────────────────────────────────

function GradeParticles({ grade }: { grade: string }) {
  if (grade === 'N' || grade === 'R') return null;

  const configs: Record<string, { count: number; colors: string[]; size: number }> = {
    SR: { count: 15, colors: ['#a78bfa', '#7c3aed', '#c4b5fd'], size: 4 },
    SSR: { count: 25, colors: ['#fbbf24', '#f59e0b', '#fde68a', '#fff'], size: 5 },
    UR: { count: 35, colors: ['#ef4444', '#dc2626', '#fca5a5', '#fff'], size: 5 },
    SSS: { count: 55, colors: ['#f093fb', '#f5576c', '#4facfe', '#f9ca24', '#fff'], size: 6 },
  };
  const cfg = configs[grade];
  if (!cfg) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {Array.from({ length: cfg.count }, (_, i) => {
        const angle = (i / cfg.count) * 360;
        const dist = 60 + Math.random() * 80;
        const dx = Math.cos((angle * Math.PI) / 180) * dist;
        const dy = Math.sin((angle * Math.PI) / 180) * dist;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: cfg.size,
              height: cfg.size,
              backgroundColor: cfg.colors[i % cfg.colors.length],
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0 }}
            transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

// ─── 단일 카드 플립 컴포넌트 ──────────────────────────────────────────────

interface FlippableCardProps {
  card: Card;
  autoFlip: boolean;
  onFlipped: () => void;
  /** 10연차 등 다중 카드 모드에서는 설명 패널 없이 단순 플립만 */
  simple?: boolean;
}

function FlippableCard({ card, autoFlip, onFlipped, simple = false }: FlippableCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const flippedRef = useRef(false);

  const doFlip = () => {
    if (flippedRef.current) return;
    flippedRef.current = true;
    setFlipped(true);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1200);
    setTimeout(() => onFlipped(), 900);
  };

  useEffect(() => {
    if (autoFlip && !flippedRef.current) {
      const t = setTimeout(doFlip, 200);
      return () => clearTimeout(t);
    }
  // doFlip is stable (uses ref), excluding from deps is intentional
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFlip]);

  const scale = simple ? 0.62 : 1;
  const w = simple ? 'w-32' : 'w-52';
  const h = simple ? 'h-[185px]' : 'h-[295px]';

  return (
    <div className={cn('relative', w, h)} style={{ perspective: 1000 }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
      >
        {/* 뒷면 */}
        <div
          style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
          onClick={simple ? undefined : doFlip}
        >
          {simple ? (
            <div
              className={cn('relative rounded-2xl overflow-hidden cursor-pointer', w, h)}
              style={{ background: 'linear-gradient(135deg, #f0effe 0%, #ffe8ee 100%)' }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl opacity-40 text-primary-400">✦</div>
              </div>
              <div className="absolute inset-2 border border-primary-300/40 rounded-xl" />
            </div>
          ) : (
            <CardBack onClick={doFlip} grade={card.grade} />
          )}
        </div>
        {/* 앞면 */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
          }}
        >
          {simple ? (
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <CardFront card={card} />
            </div>
          ) : (
            <CardFront card={card} />
          )}
        </div>
      </motion.div>
      {/* 파티클 버스트 */}
      {showParticles && flipped && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
          <GradeParticles grade={card.grade} />
        </div>
      )}
    </div>
  );
}

// SajuExplanationPanel은 SajuConnectionPanel로 대체됨

// ─── 메인 애니메이션 컴포넌트 ─────────────────────────────────────────────

type AnimationStage = 'pack' | 'reveal' | 'single-flip' | 'multi-flip' | 'explanation' | 'done';

export interface CardPullAnimationProps {
  cards: Card[];
  explanation?: CardSajuExplanation | null;
  onComplete: () => void;
  onSkip: () => void;
}

export default function CardPullAnimation({
  cards,
  explanation,
  onComplete,
  onSkip,
}: CardPullAnimationProps) {
  const isSingle = cards.length === 1;
  const [stage, setStage] = useState<AnimationStage>('pack');
  const [autoFlipIndex, setAutoFlipIndex] = useState(-1);
  const [flippedCount, setFlippedCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  // pack → reveal 전환
  useEffect(() => {
    const t = setTimeout(() => setStage('reveal'), 1200);
    return () => clearTimeout(t);
  }, []);

  // reveal → single-flip / multi-flip 전환
  useEffect(() => {
    if (stage !== 'reveal') return;
    const t = setTimeout(() => {
      setStage(isSingle ? 'single-flip' : 'multi-flip');
    }, 800);
    return () => clearTimeout(t);
  }, [stage, isSingle]);

  // 다중 카드 모드: 순서대로 자동 플립
  useEffect(() => {
    if (stage !== 'multi-flip') return;
    const timers = cards.map((_, i) =>
      setTimeout(() => setAutoFlipIndex(i), i * 350 + 400)
    );
    return () => timers.forEach(clearTimeout);
  }, [stage, cards]);

  // 단일 카드 플립 완료 콜백
  const handleSingleFlipped = () => {
    if (explanation) {
      setShowExplanation(true);
    } else {
      setStage('done');
    }
  };

  // 다중 카드 플립 완료 카운트
  const handleMultiFlipped = () => {
    setFlippedCount((c) => {
      const next = c + 1;
      if (next >= cards.length) {
        setTimeout(() => setStage('done'), 1000);
      }
      return next;
    });
  };

  // done → onComplete
  useEffect(() => {
    if (stage !== 'done') return;
    const t = setTimeout(onComplete, 600);
    return () => clearTimeout(t);
  }, [stage, onComplete]);

  if (stage === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto py-10 px-4"
      style={{ background: 'linear-gradient(160deg, #f0effe 0%, #ffe8ee 50%, #FBF4E2 100%)' }}
    >
      {/* 건너뛰기 버튼 */}
      <button
        onClick={onSkip}
        className="fixed top-4 right-4 text-gray-500/70 text-sm px-4 py-2 rounded-full border border-gray-300/50 bg-white/60 backdrop-blur-sm z-10"
      >
        건너뛰기
      </button>

      <AnimatePresence mode="wait">
        {/* 팩 등장 */}
        {stage === 'pack' && (
          <motion.div
            key="pack"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="flex flex-col items-center gap-4 mt-16"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-40 h-56 bg-gradient-to-br from-secondary-200 to-primary-200 rounded-2xl shadow-soft-lg border border-primary-200/60 flex items-center justify-center"
            >
              <div className="text-5xl">✦</div>
            </motion.div>
            <p className="text-gray-600 text-sm animate-pulse">운명의 팩이 도착했어요!</p>
          </motion.div>
        )}

        {/* 단일 카드 플립 뷰 */}
        {(stage === 'single-flip' || (stage === 'reveal' && isSingle)) && (
          <motion.div
            key="single"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="flex flex-col items-center gap-0 mt-4"
          >
            {/* 등급별 화면 효과 */}
            {cards[0] && (cards[0].grade === 'SSS' || cards[0].grade === 'UR' || cards[0].grade === 'SSR') && (
              <motion.div
                className="fixed inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  background:
                    cards[0].grade === 'SSS'
                      ? 'radial-gradient(ellipse at center, rgba(240,147,251,0.3) 0%, transparent 70%)'
                      : cards[0].grade === 'UR'
                      ? 'radial-gradient(ellipse at center, rgba(239,68,68,0.25) 0%, transparent 70%)'
                      : 'radial-gradient(ellipse at center, rgba(245,158,11,0.2) 0%, transparent 70%)',
                }}
              />
            )}

            <FlippableCard
              card={cards[0]}
              autoFlip={stage === 'single-flip'}
              onFlipped={handleSingleFlipped}
              simple={false}
            />

            {/* 사주 발현 패널 */}
            <AnimatePresence>
              {showExplanation && explanation && (
                <div className="w-full max-w-xs mt-5">
                  <SajuConnectionPanel
                    explanation={explanation}
                    cardElement={cards[0]?.element as Element | undefined}
                    onClose={() => setStage('done')}
                  />
                </div>
              )}
            </AnimatePresence>

            {/* 사주 패널 없을 때 확인 버튼 */}
            {showExplanation && !explanation && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => setStage('done')}
                className="mt-5 bg-primary-500 text-white px-8 py-3 rounded-2xl font-bold text-sm"
              >
                컬렉션에 추가
              </motion.button>
            )}
          </motion.div>
        )}

        {/* 다중 카드 플립 뷰 */}
        {(stage === 'multi-flip' || (stage === 'reveal' && !isSingle)) && (
          <motion.div
            key="multi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap justify-center gap-3 px-2 mt-6 max-w-sm"
          >
            {cards.map((card, i) => (
              <FlippableCard
                key={i}
                card={card}
                autoFlip={autoFlipIndex >= i}
                onFlipped={handleMultiFlipped}
                simple={true}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
