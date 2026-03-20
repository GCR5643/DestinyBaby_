'use client';

import { motion } from 'framer-motion';

const MOCK_NAMING_STATS = [
  { period: '오늘', requests: 42, reports: 8, revenue: '₩8,000' },
  { period: '이번주', requests: 312, reports: 67, revenue: '₩67,000' },
  { period: '이번달', requests: 1240, reports: 280, revenue: '₩280,000' },
];

const TOP_NAMES = [
  { name: '지우', hanja: '智宇', count: 89 },
  { name: '서연', hanja: '瑞然', count: 72 },
  { name: '하준', hanja: '夏俊', count: 65 },
  { name: '유나', hanja: '裕娜', count: 58 },
  { name: '민준', hanja: '敏俊', count: 51 },
];

export default function AdminNamingPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-primary-600 pt-8 pb-6 px-4 text-white">
        <h1 className="text-xl font-bold">작명 관리</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-4">
        {/* Stats */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">통계</h2>
          <div className="space-y-2">
            {MOCK_NAMING_STATS.map(stat => (
              <div key={stat.period} className="grid grid-cols-4 text-sm py-2 border-b border-gray-50">
                <div className="font-medium text-gray-700">{stat.period}</div>
                <div className="text-center text-gray-600">{stat.requests}건</div>
                <div className="text-center text-primary-600">{stat.reports}건</div>
                <div className="text-right font-semibold text-gray-800">{stat.revenue}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top names */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">인기 생성 이름 TOP 5</h2>
          <div className="space-y-2">
            {TOP_NAMES.map((n, i) => (
              <div key={n.name} className="flex items-center gap-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-800">{n.name}</span>
                  <span className="text-gray-400 text-sm ml-2">{n.hanja}</span>
                </div>
                <div className="text-sm text-gray-500">{n.count}회</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
