'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Share2, CreditCard, Stars, Volume2 } from 'lucide-react';
import type { NamingReport } from '@/types';
import { cn } from '@/lib/utils';

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <motion.circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="#6C5CE7"
            strokeWidth="6"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-primary-600">{score}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function NamingReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '지우';
  const hanja = searchParams.get('hanja') || '智宇';
  const [isPurchased, setIsPurchased] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const mockReport: NamingReport = {
    name, hanja,
    strokeAnalysis: { totalStrokes: 18, heavenGrade: 12, humanGrade: 18, earthGrade: 6, outerGrade: 12, totalGrade: 18, luckScore: 88 },
    yinYangFiveElements: { elements: ['water', 'wood'], balance: '균형잡힌', recommendation: '오행이 조화롭게 배합되어 있습니다' },
    pronunciationAnalysis: { harmony: 92, initialConsonants: ['ㅈ', 'ㅇ'], comment: '자음과 모음의 조화가 훌륭합니다. 부르기 쉽고 듣기 좋은 이름입니다.' },
    meaningBreakdown: [
      { char: '지', hanja: '智', meaning: '지혜로울 지 — 총명하고 지혜로운 사람이 됩니다' },
      { char: '우', hanja: '宇', meaning: '집 우 — 드넓은 세상을 품는 큰 사람이 됩니다' },
    ],
    sajuFitScore: 92,
    parentCompatibility: { mom: 88, dad: 91, combined: 90 },
    overallComment: '"지우"는 아이의 사주에 완벽하게 어울리는 이름입니다. 지혜와 넓은 마음을 가진 사람으로 성장할 것입니다. 부모님의 기운과도 매우 잘 어울려, 가족 전체가 행복하고 건강한 삶을 누릴 것으로 보입니다.',
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    // TODO: Toss/Naver/Stripe payment
    await new Promise(r => setTimeout(r, 1500));
    setIsPurchased(true);
    setIsPurchasing(false);
  };

  if (!isPurchased) {
    return (
      <div className="min-h-screen bg-ivory pb-24">
        <div className="bg-gradient-to-br from-primary-600 to-primary-400 pt-12 pb-8 px-4 text-white text-center">
          <h1 className="text-2xl font-bold mb-1">상세 이름 리포트</h1>
          <p className="text-sm opacity-80">{name} ({hanja})</p>
        </div>

        <div className="max-w-lg mx-auto px-4 mt-6">
          {/* Preview */}
          <div className="bg-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-2xl">
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🔒</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">상세 리포트</h2>
                <p className="text-gray-500 text-sm mb-6">
                  획수 분석, 음양오행, 발음 분석, 사주 적합도,<br />
                  부모 궁합까지 한번에!
                </p>
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full bg-gradient-to-r from-gold-400 to-gold-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  {isPurchasing ? (
                    <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />결제 중...</>
                  ) : (
                    <><CreditCard className="w-5 h-5" />1,000원으로 상세 리포트 보기</>
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-2">토스페이 · 네이버페이 · 카드 결제</p>
              </div>
            </div>
            {/* Blurred preview */}
            <div className="filter blur-sm space-y-4">
              <div className="flex justify-around">
                <ScoreCircle score={92} label="사주 적합도" />
                <ScoreCircle score={88} label="엄마 궁합" />
                <ScoreCircle score={91} label="아빠 궁합" />
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-2">획수 분석</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {['천격', '인격', '지격'].map(g => (
                    <div key={g} className="bg-white rounded-lg p-2">
                      <div className="text-lg font-bold text-primary-600">??</div>
                      <div className="text-xs text-gray-400">{g}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-gradient-to-br from-primary-600 to-primary-400 pt-12 pb-8 px-4 text-white text-center">
        <h1 className="text-2xl font-bold mb-1">{name} ({hanja})</h1>
        <p className="text-sm opacity-80">상세 이름 분석 리포트</p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Scores */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Stars className="w-5 h-5 text-gold-400" />종합 점수</h2>
          <div className="flex justify-around">
            <ScoreCircle score={mockReport.sajuFitScore} label="사주 적합도" />
            <ScoreCircle score={mockReport.parentCompatibility.mom} label="엄마 궁합" />
            <ScoreCircle score={mockReport.parentCompatibility.dad} label="아빠 궁합" />
          </div>
        </motion.div>

        {/* Stroke Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="font-bold text-gray-800 mb-4">📊 획수 분석</h2>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label: '천격', value: mockReport.strokeAnalysis.heavenGrade },
              { label: '인격', value: mockReport.strokeAnalysis.humanGrade },
              { label: '지격', value: mockReport.strokeAnalysis.earthGrade },
              { label: '외격', value: mockReport.strokeAnalysis.outerGrade },
              { label: '총격', value: mockReport.strokeAnalysis.totalGrade },
              { label: '운세점수', value: mockReport.strokeAnalysis.luckScore },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-primary-600">{item.value}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Meaning */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="font-bold text-gray-800 mb-4">🔤 한자 뜻풀이</h2>
          <div className="space-y-3">
            {mockReport.meaningBreakdown.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="text-center min-w-12">
                  <div className="text-2xl font-bold text-primary-600">{item.hanja}</div>
                  <div className="text-base text-gray-700">{item.char}</div>
                </div>
                <p className="text-sm text-gray-600 pt-1">{item.meaning}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pronunciation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="font-bold text-gray-800 mb-3">🎵 발음 분석</h2>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-primary-600">{mockReport.pronunciationAnalysis.harmony}</div>
              <div className="text-xs text-gray-500">조화 점수</div>
            </div>
            <p className="text-sm text-gray-600 flex-1">{mockReport.pronunciationAnalysis.comment}</p>
          </div>
        </motion.div>

        {/* Overall Comment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100">
          <h2 className="font-bold text-gray-800 mb-3">✨ 종합 분석</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{mockReport.overallComment}</p>
        </motion.div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-100 text-gray-700 text-sm font-medium">
            <Download className="w-4 h-4" />PDF 저장
          </button>
          <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-secondary-400 text-white text-sm font-medium">
            <Share2 className="w-4 h-4" />SNS 공유
          </button>
        </div>

        {/* Card Pull CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <button
            onClick={() => router.push('/cards')}
            className="w-full bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-4 rounded-2xl font-bold text-base shadow-lg"
          >
            🃏 이 사주로 태어난 아이의 운명 카드를 뽑아보세요!
          </button>
        </motion.div>
      </div>
    </div>
  );
}
