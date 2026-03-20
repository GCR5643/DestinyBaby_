'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '@/types';
import { getGradeColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

type AnimationStage = 'pack' | 'toss' | 'reveal' | 'flip' | 'confetti' | 'done';

interface CardPullAnimationProps {
  cards: Card[];
  onComplete: () => void;
  onSkip: () => void;
}

function GradeAura({ grade }: { grade: string }) {
  const isSSS = grade === 'SSS';
  return (
    <motion.div
      className={cn(
        'absolute inset-0 rounded-2xl',
        isSSS ? 'animate-glow-pulse' : ''
      )}
      style={{
        boxShadow: isSSS
          ? '0 0 60px rgba(225, 112, 85, 0.8), 0 0 120px rgba(108, 92, 231, 0.6)'
          : grade === 'SS' ? '0 0 40px rgba(253, 121, 168, 0.7)'
          : grade === 'S' ? '0 0 30px rgba(162, 155, 254, 0.6)'
          : grade === 'A' ? '0 0 20px rgba(249, 202, 36, 0.5)'
          : '0 0 10px rgba(149, 165, 166, 0.3)',
      }}
    />
  );
}

function CardBack({ grade }: { grade: string }) {
  return (
    <div className="relative w-52 h-[295px] rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #2D1B69 100%)' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-6xl opacity-20">✦</div>
      </div>
      <div className="absolute inset-2 border border-primary-400/30 rounded-xl" />
      <GradeAura grade={grade} />
    </div>
  );
}

function CardFront({ card }: { card: Card }) {
  return (
    <div className="relative w-52 h-[295px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary-900 to-indigo-900">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">✨</div>
        <div className="text-center">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
            style={{ backgroundColor: getGradeColor(card.grade) !== 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)' ? getGradeColor(card.grade) : '#6C5CE7', color: 'white' }}>
            {card.grade}
          </div>
          <h3 className="text-white font-bold text-lg">{card.name}</h3>
          <p className="text-white/60 text-xs mt-1">{card.element}</p>
        </div>
      </div>
      <div className="absolute inset-2 border border-white/10 rounded-xl" />
    </div>
  );
}

export default function CardPullAnimation({ cards, onComplete, onSkip }: CardPullAnimationProps) {
  const [stage, setStage] = useState<AnimationStage>('pack');
  const [flippedCards, setFlippedCards] = useState<boolean[]>(new Array(cards.length).fill(false));

  useEffect(() => {
    const stageTimings: { stage: AnimationStage; delay: number }[] = [
      { stage: 'toss', delay: 1500 },
      { stage: 'reveal', delay: 2500 },
      { stage: 'flip', delay: 3000 },
      { stage: 'confetti', delay: 4000 },
      { stage: 'done', delay: 5500 },
    ];

    const timers = stageTimings.map(({ stage, delay }) =>
      setTimeout(() => setStage(stage), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage === 'flip') {
      const timers = cards.map((_, i) =>
        setTimeout(() => {
          setFlippedCards(prev => { const next = [...prev]; next[i] = true; return next; });
        }, i * 300)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [stage, cards]);

  useEffect(() => {
    if (stage === 'done') {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
  }, [stage, onComplete]);

  if (stage === 'done') return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #2D1B69 100%)' }}>

      {/* Skip button */}
      <button onClick={onSkip} className="absolute top-4 right-4 text-white/50 text-sm px-4 py-2 rounded-full border border-white/20">
        건너뛰기
      </button>

      <AnimatePresence mode="wait">
        {stage === 'pack' && (
          <motion.div key="pack"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-40 h-56 bg-gradient-to-br from-primary-600 to-indigo-800 rounded-2xl shadow-2xl border border-primary-400/40 flex items-center justify-center">
              <div className="text-5xl">✦</div>
            </motion.div>
            <p className="text-white/80 text-sm animate-pulse">운명의 팩이 도착했어요!</p>
          </motion.div>
        )}

        {(stage === 'toss' || stage === 'reveal' || stage === 'flip' || stage === 'confetti') && (
          <motion.div key="cards"
            className="flex flex-wrap justify-center gap-3 px-4 max-w-sm">
            {cards.map((card, i) => (
              <motion.div key={i}
                initial={{ y: -100, opacity: 0, rotateZ: Math.random() * 40 - 20 }}
                animate={{ y: 0, opacity: 1, rotateZ: 0 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                className="card-3d-container cursor-pointer"
                onClick={() => {
                  const next = [...flippedCards]; next[i] = !next[i];
                  setFlippedCards(next);
                }}>
                <div className={cn('card-3d-inner w-32 h-[185px] relative', flippedCards[i] ? '[transform:rotateY(180deg)]' : '')}>
                  <div className="card-3d-front absolute inset-0">
                    <CardBack grade={card.grade} />
                  </div>
                  <div className="card-3d-back absolute inset-0">
                    <div className="w-32 h-[185px] scale-[0.615] origin-top-left">
                      <CardFront card={card} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti particles */}
      {stage === 'confetti' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#F9CA24', '#6C5CE7', '#FFB8C6', '#00b894', '#74b9ff'][Math.floor(Math.random() * 5)],
              }}
              initial={{ y: '-10vh', opacity: 1 }}
              animate={{ y: '110vh', opacity: 0, rotate: 720 }}
              transition={{ duration: 1.5 + Math.random(), delay: Math.random() * 0.5 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
