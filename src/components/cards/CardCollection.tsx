'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import CardDisplay from './CardDisplay';
import type { UserCard, Grade } from '@/types';
import { cn } from '@/lib/utils';
import { CozyPanel } from '@/components/cozy';

const GRADES: Grade[] = ['N', 'R', 'SR', 'SSR', 'UR', 'SSS'];

interface CardCollectionProps {
  userCards: UserCard[];
  onFavorite?: (cardId: string) => void;
}

export default function CardCollection({ userCards, onFavorite }: CardCollectionProps) {
  const [selectedGrade, setSelectedGrade] = useState<Grade | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'grade' | 'name'>('recent');

  const filtered = userCards
    .filter(uc => selectedGrade === 'all' || uc.card?.grade === selectedGrade)
    .sort((a, b) => {
      if (sortBy === 'grade') {
        return GRADES.indexOf(b.card?.grade as Grade) - GRADES.indexOf(a.card?.grade as Grade);
      }
      if (sortBy === 'name') return (a.card?.name || '').localeCompare(b.card?.name || '');
      return new Date(b.obtained_at).getTime() - new Date(a.obtained_at).getTime();
    });

  return (
    <CozyPanel padding="md">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <button
          onClick={() => setSelectedGrade('all')}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border',
            selectedGrade === 'all'
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100'
          )}
        >
          전체 ({userCards.length})
        </button>
        {GRADES.map(grade => {
          const count = userCards.filter(uc => uc.card?.grade === grade).length;
          if (count === 0) return null;
          return (
            <button key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border',
                selectedGrade === grade
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100'
              )}
            >
              {grade} ({count})
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-4">
        {[{ value: 'recent', label: '최신순' }, { value: 'grade', label: '등급순' }, { value: 'name', label: '이름순' }].map(opt => (
          <button key={opt.value}
            onClick={() => setSortBy(opt.value as 'recent' | 'grade' | 'name')}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-all',
              sortBy === opt.value
                ? 'border-primary-400 text-primary-600 bg-primary-50'
                : 'border-gray-200 text-gray-500 hover:border-primary-200 hover:text-primary-500'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🃏</div>
          <p className="text-sm">카드가 없어요. 뽑기를 해보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((uc, i) => uc.card && (
            <motion.div key={uc.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}>
              <CardDisplay
                card={uc.card}
                size="sm"
                isFavorite={uc.is_favorite}
                onFavorite={() => onFavorite?.(uc.card!.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </CozyPanel>
  );
}
