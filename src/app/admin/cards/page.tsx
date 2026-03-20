'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type Grade = 'B' | 'A' | 'S' | 'SS' | 'SSS';

const GRADE_COLORS: Record<Grade, string> = {
  B: '#95a5a6',
  A: '#F9CA24',
  S: '#a29bfe',
  SS: '#fd79a8',
  SSS: '#e17055',
};

const ELEMENTS = ['🔥 화', '💧 수', '🌿 목', '⚡ 전', '🌙 음', '☀️ 양', '🌪️ 풍', '🪨 토'];
const GRADES: Grade[] = ['B', 'A', 'S', 'SS', 'SSS'];

interface Card {
  id: number;
  name: string;
  grade: Grade;
  element: string;
  description: string;
}

const MOCK_CARDS: Card[] = [
  { id: 1, name: '청룡', grade: 'SSS', element: '🔥 화', description: '동방의 수호신, 강력한 화염 속성' },
  { id: 2, name: '백호', grade: 'SS', element: '⚡ 전', description: '서방의 수호신, 번개를 다룬다' },
  { id: 3, name: '현무', grade: 'SS', element: '💧 수', description: '북방의 수호신, 물의 정령' },
  { id: 4, name: '주작', grade: 'S', element: '🔥 화', description: '남방의 수호신, 불꽃 새' },
  { id: 5, name: '기린', grade: 'S', element: '🌿 목', description: '상서로운 짐승, 목 속성 치유' },
  { id: 6, name: '봉황', grade: 'A', element: '☀️ 양', description: '불사조, 양기 가득한 영물' },
  { id: 7, name: '해태', grade: 'A', element: '🌙 음', description: '정의의 수호자, 음 속성' },
  { id: 8, name: '삽살개', grade: 'B', element: '🪨 토', description: '토속 수호견, 잡귀를 쫓는다' },
];

function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span
      className="inline-flex items-center justify-center w-10 h-6 rounded-full text-white text-xs font-black"
      style={{ backgroundColor: GRADE_COLORS[grade] }}
    >
      {grade}
    </span>
  );
}

export default function CardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>(MOCK_CARDS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', grade: 'B' as Grade, element: ELEMENTS[0], description: '' });

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-8 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.push('/admin')}
          className="text-gray-500 hover:text-gray-800 font-medium text-sm"
        >
          ← 뒤로
        </button>
        <h1 className="text-lg font-black text-gray-800 flex-1">카드 관리</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
        >
          + 카드 추가
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 text-xs text-gray-400 font-medium grid grid-cols-12 gap-2">
            <span className="col-span-2">등급</span>
            <span className="col-span-3">이름</span>
            <span className="col-span-2">속성</span>
            <span className="col-span-3">설명</span>
            <span className="col-span-2 text-right">관리</span>
          </div>

          <AnimatePresence>
            {cards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.04 }}
                className="px-4 py-3 border-b border-gray-50 last:border-0 grid grid-cols-12 gap-2 items-center"
              >
                <div className="col-span-2">
                  <GradeBadge grade={card.grade} />
                </div>
                <div className="col-span-3 text-sm font-bold text-gray-800">{card.name}</div>
                <div className="col-span-2 text-sm">{card.element}</div>
                <div className="col-span-3 text-xs text-gray-400 truncate">{card.description}</div>
                <div className="col-span-2 flex gap-1 justify-end">
                  <button
                    onClick={() => alert(`${card.name} 편집`)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium px-1"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => alert(`${card.name} 삭제`)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium px-1"
                  >
                    삭제
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
            >
              <h2 className="text-base font-black text-gray-800 mb-4">카드 추가</h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">카드 이름</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="예: 청룡"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">등급</label>
                    <select
                      value={form.grade}
                      onChange={(e) => setForm({ ...form, grade: e.target.value as Grade })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">속성</label>
                    <select
                      value={form.element}
                      onChange={(e) => setForm({ ...form, element: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {ELEMENTS.map((el) => (
                        <option key={el} value={el}>{el}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">설명</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="카드 설명을 입력하세요"
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-500 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => { alert('저장됨'); setShowModal(false); }}
                  className="flex-1 bg-purple-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-purple-700 transition-colors"
                >
                  저장
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
