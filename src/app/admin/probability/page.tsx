'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

const GRADES: Grade[] = ['N', 'R', 'SR', 'SSR', 'UR', 'SSS'];

// Fallback defaults (stored in DB as 0-1 decimal; displayed as 0-100 %)
const DEFAULT_PROBS: Record<Grade, number> = {
  N: 40,
  R: 30,
  SR: 15,
  SSR: 8,
  UR: 4,
  SSS: 3,
};

const DEFAULT_PITY: Record<string, number> = { UR: 50, SSS: 90 };

interface GachaRow {
  id: string;
  grade: Grade;
  probability: number;
  pity_threshold: number | null;
}

export default function ProbabilityPage() {
  const router = useRouter();
  const [probs, setProbs] = useState<Record<Grade, number>>(DEFAULT_PROBS);
  const [urPity, setUrPity] = useState(DEFAULT_PITY.UR);
  const [sssPity, setSssPity] = useState(DEFAULT_PITY.SSS);
  const [rowIds, setRowIds] = useState<Partial<Record<Grade, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('gacha_probability_config')
        .select('id, grade, probability, pity_threshold');
      if (error) throw error;

      const newProbs = { ...DEFAULT_PROBS };
      const newPity = { ...DEFAULT_PITY };
      const ids: Partial<Record<Grade, string>> = {};

      for (const row of (data ?? []) as GachaRow[]) {
        const grade = row.grade as Grade;
        if (GRADES.includes(grade)) {
          // DB stores 0-1 decimal; convert to percentage for display
          newProbs[grade] = Math.round(row.probability * 100);
          ids[grade] = row.id;
        }
        if (grade === 'UR' && row.pity_threshold != null) newPity.UR = row.pity_threshold;
        if (grade === 'SSS' && row.pity_threshold != null) newPity.SSS = row.pity_threshold;
      }

      setProbs(newProbs);
      setUrPity(newPity.UR);
      setSssPity(newPity.SSS);
      setRowIds(ids);
    } catch {
      // fallback: use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleProb = (grade: Grade, val: number) => {
    setProbs((prev) => ({ ...prev, [grade]: Math.max(0, Math.min(100, val)) }));
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    try {
      const upsertRows = GRADES.map((grade) => ({
        ...(rowIds[grade] ? { id: rowIds[grade] } : {}),
        grade,
        // Store as 0-1 decimal
        probability: probs[grade] / 100,
        pity_threshold: grade === 'UR' ? urPity : grade === 'SSS' ? sssPity : null,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('gacha_probability_config')
        .upsert(upsertRows, { onConflict: 'grade' });

      if (error) throw error;
      alert('확률 설정이 저장되었습니다');
      // Refresh IDs after upsert
      await fetchConfig();
    } catch {
      alert('저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  const total = Object.values(probs).reduce((a, b) => a + b, 0);
  const isValid = total === 100;

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
        <h1 className="text-lg font-black text-gray-800 flex-1">확률 관리</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">불러오는 중...</div>
        ) : (
          <>
            {/* Probability sliders */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-gray-800">등급별 확률</h2>
                <span className={`text-sm font-black ${isValid ? 'text-green-500' : 'text-red-500'}`}>
                  합계: {total}% {isValid ? '✓' : '⚠ 100이어야 합니다'}
                </span>
              </div>

              <div className="space-y-5">
                {GRADES.map((grade) => (
                  <div key={grade}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="inline-flex items-center justify-center w-10 h-6 rounded-full text-white text-xs font-black"
                        style={{ backgroundColor: GRADE_COLORS[grade] }}
                      >
                        {grade}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={probs[grade]}
                          onChange={(e) => handleProb(grade, Number(e.target.value))}
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
                          min={0}
                          max={100}
                        />
                        <span className="text-sm text-gray-400">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={probs[grade]}
                      onChange={(e) => handleProb(grade, Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: GRADE_COLORS[grade] }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-black text-gray-800 mb-4">확률 분포 차트</h2>
              <div className="flex items-end gap-2 h-32">
                {GRADES.map((grade) => (
                  <div key={grade} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-600">{probs[grade]}%</span>
                    <div
                      className="w-full rounded-t-lg transition-all duration-300"
                      style={{
                        backgroundColor: GRADE_COLORS[grade],
                        height: `${(probs[grade] / 100) * 100}px`,
                        minHeight: '4px',
                      }}
                    />
                    <span className="text-xs font-black" style={{ color: GRADE_COLORS[grade] }}>
                      {grade}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                * 사주에 따라 기본 확률 최대 20% 상향 조정됩니다
              </p>
            </div>

            {/* Pity settings */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-black text-gray-800 mb-4">천장 (Pity) 설정</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700">UR 천장</p>
                    <p className="text-xs text-gray-400">해당 횟수 이내 UR 미등장 시 보장</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={urPity}
                      onChange={(e) => setUrPity(Number(e.target.value))}
                      className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
                      min={1}
                    />
                    <span className="text-sm text-gray-400">회</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700">SSS 천장</p>
                    <p className="text-xs text-gray-400">해당 횟수 이내 SSS 미등장 시 보장</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={sssPity}
                      onChange={(e) => setSssPity(Number(e.target.value))}
                      className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
                      min={1}
                    />
                    <span className="text-sm text-gray-400">회</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !isValid}
              className="w-full bg-purple-600 text-white font-black py-3.5 rounded-2xl hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {saving ? '저장중...' : '저장'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
