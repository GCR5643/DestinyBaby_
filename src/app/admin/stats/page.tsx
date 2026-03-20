'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Period = '오늘' | '이번주' | '이번달';
type Grade = 'B' | 'A' | 'S' | 'SS' | 'SSS';

const GRADE_COLORS: Record<Grade, string> = {
  B: '#95a5a6',
  A: '#F9CA24',
  S: '#a29bfe',
  SS: '#fd79a8',
  SSS: '#e17055',
};

const METRICS: Record<Period, { revenue: string; newUsers: number; pulls: number; naming: number }> = {
  '오늘': { revenue: '₩28,000', newUsers: 12, pulls: 342, naming: 42 },
  '이번주': { revenue: '₩196,000', newUsers: 87, pulls: 2401, naming: 294 },
  '이번달': { revenue: '₩840,000', newUsers: 374, pulls: 10320, naming: 1260 },
};

const TOP_NAMES: Record<Period, { rank: number; name: string; count: number }[]> = {
  '오늘': [
    { rank: 1, name: '서준', count: 8 },
    { rank: 2, name: '지아', count: 6 },
    { rank: 3, name: '민준', count: 5 },
    { rank: 4, name: '하은', count: 4 },
    { rank: 5, name: '시우', count: 3 },
  ],
  '이번주': [
    { rank: 1, name: '서준', count: 52 },
    { rank: 2, name: '민준', count: 41 },
    { rank: 3, name: '지아', count: 38 },
    { rank: 4, name: '하은', count: 29 },
    { rank: 5, name: '유준', count: 24 },
  ],
  '이번달': [
    { rank: 1, name: '서준', count: 218 },
    { rank: 2, name: '민준', count: 174 },
    { rank: 3, name: '지아', count: 162 },
    { rank: 4, name: '하윤', count: 145 },
    { rank: 5, name: '시우', count: 130 },
  ],
};

const GRADE_DIST: Record<Period, Record<Grade, number>> = {
  '오늘': { B: 137, A: 103, S: 62, SS: 31, SSS: 9 },
  '이번주': { B: 960, A: 721, S: 432, SS: 216, SSS: 72 },
  '이번달': { B: 4128, A: 3096, S: 1856, SS: 928, SSS: 312 },
};

const PAYMENTS: Record<Period, { user: string; amount: string; pack: string; time: string }[]> = {
  '오늘': [
    { user: '행운아민준', amount: '₩9,900', pack: '100크레딧', time: '14:32' },
    { user: '통계덕후', amount: '₩4,900', pack: '50크레딧', time: '12:15' },
    { user: '새댁엄마', amount: '₩19,900', pack: '230크레딧', time: '09:44' },
  ],
  '이번주': [
    { user: '행운아민준', amount: '₩49,500', pack: '550크레딧', time: '1/15 14:32' },
    { user: '통계덕후', amount: '₩29,700', pack: '330크레딧', time: '1/14 20:11' },
    { user: '그림쟁이수아', amount: '₩19,900', pack: '230크레딧', time: '1/13 11:05' },
    { user: '도사님', amount: '₩9,900', pack: '100크레딧', time: '1/12 08:30' },
  ],
  '이번달': [
    { user: '행운아민준', amount: '₩148,500', pack: '합산', time: '이번달' },
    { user: '통계덕후', amount: '₩99,000', pack: '합산', time: '이번달' },
    { user: '그림쟁이수아', amount: '₩79,200', pack: '합산', time: '이번달' },
    { user: '새댁엄마', amount: '₩49,500', pack: '합산', time: '이번달' },
    { user: '도사님', amount: '₩19,900', pack: '합산', time: '이번달' },
  ],
};

const RANK_COLORS = ['#F9CA24', '#b2bec3', '#e17055', '#74b9ff', '#a29bfe'];

export default function StatsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('오늘');

  const metrics = METRICS[period];
  const gradeData = GRADE_DIST[period];
  const totalPulls = Object.values(gradeData).reduce((a, b) => a + b, 0);

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
        <h1 className="text-lg font-black text-gray-800 flex-1">통계</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* Period selector */}
        <div className="flex gap-2 bg-white rounded-2xl shadow-sm p-1.5">
          {(['오늘', '이번주', '이번달'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                period === p ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Key metrics 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '총 매출', value: metrics.revenue, emoji: '💰' },
            { label: '신규 유저', value: `${metrics.newUsers}명`, emoji: '👤' },
            { label: '총 뽑기', value: `${metrics.pulls.toLocaleString()}회`, emoji: '🃏' },
            { label: '작명 요청', value: `${metrics.naming}건`, emoji: '✏️' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">{m.emoji}</div>
              <div className="text-xl font-black text-gray-800">{m.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Grade distribution */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-black text-gray-800 mb-4">등급 분포</h2>
          <div className="space-y-2">
            {(['B', 'A', 'S', 'SS', 'SSS'] as Grade[]).map((grade) => {
              const count = gradeData[grade];
              const pct = totalPulls > 0 ? ((count / totalPulls) * 100).toFixed(1) : '0.0';
              const width = totalPulls > 0 ? (count / totalPulls) * 100 : 0;
              return (
                <div key={grade} className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center justify-center w-10 h-6 rounded-full text-white text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: GRADE_COLORS[grade] }}
                  >
                    {grade}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${width}%`, backgroundColor: GRADE_COLORS[grade] }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">{count}회 ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 popular names */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-black text-gray-800 mb-4">인기 작명 TOP 5</h2>
          <div className="space-y-2">
            {TOP_NAMES[period].map((item) => (
              <div key={item.rank} className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: RANK_COLORS[item.rank - 1] ?? '#b2bec3' }}
                >
                  {item.rank}
                </span>
                <span className="flex-1 font-bold text-gray-800 text-sm">{item.name}</span>
                <span className="text-xs text-gray-400">{item.count}건</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-black text-gray-800">최근 결제</h2>
          </div>
          {PAYMENTS[period].map((pay, i) => (
            <div key={i} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-800">{pay.user}</div>
                <div className="text-xs text-gray-400">{pay.pack} · {pay.time}</div>
              </div>
              <span className="text-sm font-black text-green-600">{pay.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
