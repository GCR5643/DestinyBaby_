'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Volume2, ChevronRight } from 'lucide-react';
import type { EnglishNameOption, EnglishNameSuggestion } from '@/types';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

const OPTION_CONFIG: { value: EnglishNameOption; label: string; emoji: string; description: string }[] = [
  { value: 'similar_sound', label: '발음이 비슷한', emoji: '🔊', description: '수아 → Sua, Sora' },
  { value: 'similar_meaning', label: '뜻이 비슷한', emoji: '💫', description: '하늘 → Celeste, Sky' },
  { value: 'same_initial', label: '이니셜이 같은', emoji: '🔤', description: '지민 → James, Jamie' },
  { value: 'global_popular', label: '글로벌 인기 이름', emoji: '🌍', description: '성별·연도 기준 추천' },
  { value: 'custom', label: '직접 요청하기', emoji: '✏️', description: '원하는 스타일을 직접 입력' },
];

const MATCH_TYPE_LABELS: Record<EnglishNameOption, string> = {
  similar_sound: '발음 유사',
  similar_meaning: '뜻 유사',
  same_initial: '이니셜 동일',
  global_popular: '글로벌 인기',
  custom: '맞춤 추천',
};

export default function EnglishNamePage({ params }: { params: { name: string } }) {
  const router = useRouter();
  const koreanName = decodeURIComponent(params.name);
  const [selectedOptions, setSelectedOptions] = useState<EnglishNameOption[]>(['similar_meaning']);
  const [customPrompt, setCustomPrompt] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [results, setResults] = useState<EnglishNameSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const generateEnglish = trpc.naming.generateEnglishNames.useMutation();

  const toggleOption = (opt: EnglishNameOption) => {
    setSelectedOptions(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  const handleGenerate = async () => {
    if (selectedOptions.length === 0) return;
    setIsLoading(true);
    try {
      const suggestions = await generateEnglish.mutateAsync({
        koreanName,
        hanja: '',
        gender,
        options: selectedOptions,
        customPrompt: selectedOptions.includes('custom') ? customPrompt : undefined,
      });
      setResults(suggestions);
    } catch {
      // Fallback results
      setResults([
        { englishName: 'Celeste', matchType: 'similar_meaning', reason: '하늘처럼 맑고 아름다운 의미', pronunciation: '셀레스트' },
        { englishName: 'Luna', matchType: 'similar_meaning', reason: '달처럼 빛나는 이름', pronunciation: '루나' },
        { englishName: 'Aria', matchType: 'similar_sound', reason: '발음이 자연스럽게 어울립니다', pronunciation: '아리아' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedResults = results.reduce((acc, r) => {
    if (!acc[r.matchType]) acc[r.matchType] = [];
    acc[r.matchType].push(r);
    return acc;
  }, {} as Record<string, EnglishNameSuggestion[]>);

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-gradient-to-br from-indigo-600 to-primary-500 pt-12 pb-8 px-4 text-white text-center">
        <Globe className="w-8 h-8 mx-auto mb-3 opacity-90" />
        <h1 className="text-2xl font-bold mb-1">{koreanName}의 영어 이름</h1>
        <p className="text-sm opacity-80">한글 이름에 어울리는 영어 이름 추천</p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Option Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-md">
          <h2 className="font-bold text-gray-800 mb-4">추천 기준 선택</h2>
          <div className="space-y-2">
            {OPTION_CONFIG.map(opt => (
              <label key={opt.value} className="cursor-pointer block">
                <div className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                  selectedOptions.includes(opt.value)
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-100 hover:border-gray-200'
                )}>
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(opt.value)}
                    onChange={() => toggleOption(opt.value)}
                    className="sr-only"
                  />
                  <span className="text-xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-800">{opt.label} 영어 이름</div>
                    <div className="text-xs text-gray-400">{opt.description}</div>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center',
                    selectedOptions.includes(opt.value) ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
                  )}>
                    {selectedOptions.includes(opt.value) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Custom prompt */}
          <AnimatePresence>
            {selectedOptions.includes('custom') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <textarea
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="예: 강하고 독립적인 느낌, 유럽풍 이름, 3음절 이하로..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 resize-none"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Gender */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 shadow-md">
          <h2 className="font-bold text-gray-800 mb-3">성별</h2>
          <div className="grid grid-cols-3 gap-2">
            {[{ value: 'male', label: '👦 남자' }, { value: 'female', label: '👧 여자' }, { value: 'unknown', label: '🌟 미정' }].map(opt => (
              <button
                key={opt.value}
                onClick={() => setGender(opt.value as 'male' | 'female' | 'unknown')}
                className={cn(
                  'py-2.5 rounded-xl text-sm font-medium border-2 transition-all',
                  gender === opt.value ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>

        <button
          onClick={handleGenerate}
          disabled={selectedOptions.length === 0 || isLoading}
          className="w-full bg-gradient-to-r from-indigo-600 to-primary-500 text-white py-4 rounded-2xl font-bold text-base shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />영어 이름 찾는 중...</>
          ) : (
            <><Globe className="w-5 h-5" />영어 이름 추천받기</>
          )}
        </button>

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {Object.entries(groupedResults).map(([matchType, suggestions]) => (
                <div key={matchType}>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
                      {MATCH_TYPE_LABELS[matchType as EnglishNameOption]}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {suggestions.map((s, i) => (
                      <motion.div
                        key={s.englishName}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <h4 className="text-xl font-bold text-gray-800">{s.englishName}</h4>
                            <span className="text-sm text-gray-400">{s.pronunciation}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{s.reason}</p>
                        </div>
                        <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Volume2 className="w-4 h-4 text-gray-500" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
