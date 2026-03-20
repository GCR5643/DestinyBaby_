'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RefreshCw, Volume2, FileText, Globe } from 'lucide-react';
import type { SuggestedName } from '@/types';
import { getElementColor } from '@/lib/utils';
import { DemoBanner } from '@/components/naming/DemoBanner';

interface NameCardProps {
  name: SuggestedName;
  index: number;
  onSelect: (name: SuggestedName) => void;
}

function NameCard({ name, index, onSelect }: NameCardProps) {
  const elementColor = getElementColor(name.element || 'wood');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden"
      style={{ borderTop: `4px solid ${elementColor}` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{name.name}</h2>
            <p className="text-lg text-gray-400 mt-0.5">{name.hanja}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: elementColor }}>{name.sajuScore}</div>
            <div className="text-xs text-gray-400">사주 적합도</div>
          </div>
        </div>

        {/* Score bar */}
        <div className="mb-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${name.sajuScore}%` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
              className="h-full rounded-full"
              style={{ backgroundColor: elementColor }}
            />
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{name.reasonShort}</p>

        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
            <Volume2 className="w-4 h-4" />
            음성 듣기
          </button>
          <button
            onClick={() => onSelect(name)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            <FileText className="w-4 h-4" />
            상세 분석
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function NamingResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [names, setNames] = useState<SuggestedName[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id === 'guest') {
      const stored = sessionStorage.getItem('guest-naming-result');
      if (stored) {
        try {
          setNames(JSON.parse(stored));
        } catch {
          setNames([]);
        }
      }
      setIsLoading(false);
      return;
    }
    // Non-guest: use mock for now (real API load can be added here)
    const mockNames: SuggestedName[] = [
      { name: '지우', hanja: '智宇', reasonShort: '지혜롭고 드넓은 기운을 가진 이름', sajuScore: 92, element: 'water' },
      { name: '서연', hanja: '瑞然', reasonShort: '상서로운 기운이 자연스럽게 흐르는 이름', sajuScore: 88, element: 'wood' },
      { name: '하준', hanja: '夏俊', reasonShort: '여름처럼 밝고 준수한 기운', sajuScore: 85, element: 'fire' },
      { name: '유나', hanja: '裕娜', reasonShort: '풍요롭고 우아한 기운을 담은 이름', sajuScore: 83, element: 'earth' },
      { name: '민준', hanja: '敏俊', reasonShort: '영특하고 준수한 기운이 깃든 이름', sajuScore: 80, element: 'metal' },
    ];
    setNames(mockNames);
    setIsLoading(false);
  }, [params.id]);

  const handleSelectName = (name: SuggestedName) => {
    router.push(`/naming/report/${params.id}?name=${encodeURIComponent(name.name)}&hanja=${encodeURIComponent(name.hanja)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">이름을 분석하고 있어요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {params.id === 'guest' && <DemoBanner />}
      <div className="bg-gradient-to-br from-primary-500 to-primary-400 pt-12 pb-8 px-4 text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm opacity-80 mb-1">AI가 추천하는</p>
          <h1 className="text-2xl font-bold">5가지 이름</h1>
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {names.map((name, i) => (
          <NameCard key={name.name} name={name} index={i} onSelect={handleSelectName} />
        ))}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push('/naming')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-primary-300 text-primary-600 font-medium hover:bg-primary-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            다시 추천받기
          </button>
          <button
            onClick={() => router.push('/naming/english/' + names[0]?.name)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-secondary-400 text-white font-medium hover:bg-secondary-500 transition-colors"
          >
            <Globe className="w-4 h-4" />
            영어 이름도
          </button>
        </div>
      </div>
    </div>
  );
}
