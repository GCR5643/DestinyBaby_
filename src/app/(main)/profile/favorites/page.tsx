'use client';

import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import CardDisplay from '@/components/cards/CardDisplay';
import type { UserCard } from '@/types';

export default function FavoritesPage() {
  const { data, isLoading } = trpc.cards.getCollection.useQuery({ page: 1, pageSize: 100 });

  const favoriteCards: UserCard[] = ((data?.cards ?? []) as UserCard[]).filter(
    (uc: UserCard) => uc.is_favorite
  );

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 shadow-sm">
        <Link href="/profile" className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-lg font-bold text-gray-800">
          즐겨찾기{!isLoading && ` (${favoriteCards.length}개)`}
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : favoriteCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <span className="text-5xl mb-4">🌟</span>
            <p className="text-gray-500 text-sm mb-6">즐겨찾기한 카드가 없어요</p>
            <Link
              href="/cards"
              className="bg-primary-500 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              카드 뽑기 하러 가기
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {favoriteCards.map((uc, i) =>
              uc.card ? (
                <motion.div
                  key={uc.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                >
                  <CardDisplay
                    card={uc.card}
                    size="sm"
                    isFavorite={uc.is_favorite}
                  />
                </motion.div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
