'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

type Grade = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'SSS';

const GRADE_COLORS: Record<Grade, string> = {
  N: '#9CA3AF',
  R: '#3B82F6',
  SR: '#8B5CF6',
  SSR: '#F59E0B',
  UR: '#EF4444',
  SSS: '#EC4899',
};

const ELEMENTS = ['🔥 화', '💧 수', '🌿 목', '⚡ 전', '🌙 음', '☀️ 양', '🌪️ 풍', '🪨 토'];
const GRADES: Grade[] = ['N', 'R', 'SR', 'SSR', 'UR', 'SSS'];

interface Card {
  id: number;
  name: string;
  grade: Grade;
  element: string;
  description: string;
}

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
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', grade: 'N' as Grade, element: ELEMENTS[0], description: '' });

  const fetchCards = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('id, name, grade, element, description')
        .order('id');
      if (error) throw error;
      setCards((data ?? []) as Card[]);
    } catch (error) {
      console.error('[AdminCards] 카드 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleAdd = async () => {
    if (!form.name.trim()) { alert('카드 이름을 입력하세요'); return; }
    setSaving(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert({ name: form.name.trim(), grade: form.grade, element: form.element, description: form.description })
        .select()
        .single();
      if (error) throw error;
      setCards((prev) => [...prev, data as Card]);
      setForm({ name: '', grade: 'N', element: ELEMENTS[0], description: '' });
      setShowModal(false);
    } catch {
      alert('카드 저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (card: Card) => {
    if (!confirm(`"${card.name}" 카드를 삭제하시겠습니까?`)) return;
    const supabase = createClient();
    try {
      const { error } = await supabase.from('cards').delete().eq('id', card.id);
      if (error) throw error;
      setCards((prev) => prev.filter((c) => c.id !== card.id));
    } catch {
      alert('카드 삭제 중 오류가 발생했습니다');
    }
  };

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

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">불러오는 중...</div>
          ) : (
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
                      onClick={() => handleDelete(card)}
                      className="text-xs text-red-400 hover:text-red-600 font-medium px-1"
                    >
                      삭제
                    </button>
                  </div>
                </motion.div>
              ))}
              {cards.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-sm">카드가 없습니다</div>
              )}
            </AnimatePresence>
          )}
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
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex-1 bg-purple-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {saving ? '저장중...' : '저장'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
