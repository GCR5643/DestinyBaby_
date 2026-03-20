'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Grade = 'B' | 'A' | 'S' | 'SS' | 'SSS';

const GRADE_COLORS: Record<Grade, string> = {
  B: '#95a5a6',
  A: '#F9CA24',
  S: '#a29bfe',
  SS: '#fd79a8',
  SSS: '#e17055',
};

const GRADES: Grade[] = ['B', 'A', 'S', 'SS', 'SSS'];

const DEFAULT_PROBS: Record<Grade, number> = {
  B: 40,
  A: 30,
  S: 18,
  SS: 9,
  SSS: 3,
};

export default function ProbabilityPage() {
  const router = useRouter();
  const [probs, setProbs] = useState<Record<Grade, number>>(DEFAULT_PROBS);
  const [ssPity, setSsPity] = useState(50);
  const [sssPity, setSssPity] = useState(90);

  const total = Object.values(probs).reduce((a, b) => a + b, 0);
  const isValid = total === 100;

  const handleProb = (grade: Grade, val: number) => {
    setProbs((prev) => ({ ...prev, [grade]: Math.max(0, Math.min(100, val)) }));
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
        <h1 className="text-lg font-black text-gray-800 flex-1">확률 관리</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
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
                <p className="text-sm font-bold text-gray-700">SS 천장</p>
                <p className="text-xs text-gray-400">해당 횟수 이내 SS 미등장 시 보장</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={ssPity}
                  onChange={(e) => setSsPity(Number(e.target.value))}
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
          onClick={() => alert('확률 설정이 저장되었습니다')}
          className="w-full bg-purple-600 text-white font-black py-3.5 rounded-2xl hover:bg-purple-700 transition-colors"
        >
          저장
        </button>
      </div>
    </div>
  );
}
