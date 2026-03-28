'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';

const SHOP_ITEMS = [
  { id: '1', name: '봄 이벤트 팩', description: '봄 시즌 한정 카드 5장', price: 4900, cardCount: 5, isLimited: true, emoji: '🌸' },
  { id: '2', name: '운명의 팩', description: '기본 카드 1장', price: 1900, cardCount: 1, isLimited: false, emoji: '✨' },
  { id: '3', name: '황금 팩', description: 'SR 이상 보장 카드 3장', price: 7900, cardCount: 3, isLimited: false, emoji: '🏆' },
  { id: '4', name: '오행 팩', description: '오행 원소 카드 10장', price: 14900, cardCount: 10, isLimited: false, emoji: '🌊' },
];

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-gradient-to-br from-gold-400 to-gold-500 pt-12 pb-8 px-4 text-center">
        <ShoppingBag className="w-8 h-8 mx-auto mb-3 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900 mb-1">카드 샵</h1>
        <p className="text-sm text-gray-700">특별한 카드 팩을 구매해보세요</p>
      </div>

      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SHOP_ITEMS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-md"
          >
            <div className="flex items-center gap-4 p-5">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                {item.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  {item.isLimited && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">한정</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: Math.min(item.cardCount, 5) }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-gold-400 fill-gold-400" />
                  ))}
                  <span className="text-xs text-gray-400">카드 {item.cardCount}장</span>
                </div>
              </div>
              <button
                onClick={() => { const d = document.createElement('div'); d.className='fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm z-50 shadow-lg'; d.textContent='💎 결제 기능이 곧 오픈됩니다!'; document.body.appendChild(d); setTimeout(()=>d.remove(),2500); }}
                className="bg-primary-500 text-white py-2 px-4 rounded-xl font-bold text-sm flex-shrink-0"
              >
                {item.price.toLocaleString()}원
              </button>
            </div>
          </motion.div>
        ))}
        </div>
      </div>
    </div>
  );
}
