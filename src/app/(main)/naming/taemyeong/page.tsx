'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import type { TaemyeongSuggestion } from '@/types';
import { getElementColor, getElementEmoji } from '@/lib/utils';

interface TaemyeongForm {
  parent1BirthDate: string;
  parent2BirthDate: string;
  gender: 'male' | 'female' | 'unknown';
}

export default function TaemyeongPage() {
  const [results, setResults] = useState<TaemyeongSuggestion[]>([]);
  const { register, handleSubmit, watch } = useForm<TaemyeongForm>({ defaultValues: { gender: 'unknown' } });
  const generateTaemyeong = trpc.naming.generateTaemyeong.useMutation();

  const onSubmit = async (data: TaemyeongForm) => {
    const suggestions = await generateTaemyeong.mutateAsync({
      parent1BirthDate: data.parent1BirthDate,
      parent2BirthDate: data.parent2BirthDate || undefined,
      gender: data.gender,
    });
    setResults(suggestions);
  };

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-gradient-to-br from-secondary-400 to-primary-400 pt-12 pb-8 px-4 text-white text-center">
        <Heart className="w-8 h-8 mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-1">태명 추천</h1>
        <p className="text-sm opacity-80">소중한 아이의 태명을 지어드려요</p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">엄마/부모1 생년월일 *</label>
              <input type="date" {...register('parent1BirthDate', { required: true })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">아빠/부모2 생년월일</label>
              <input type="date" {...register('parent2BirthDate')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">성별 (알고 있다면)</label>
              <div className="grid grid-cols-3 gap-2">
                {[{ value: 'male', label: '👦 남자' }, { value: 'female', label: '👧 여자' }, { value: 'unknown', label: '🌟 미정' }].map(opt => (
                  <label key={opt.value} className="cursor-pointer">
                    <input type="radio" value={opt.value} {...register('gender')} className="sr-only" />
                    <div className={`text-center py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${watch('gender') === opt.value ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}>
                      {opt.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={generateTaemyeong.isPending} className="w-full bg-gradient-to-r from-secondary-400 to-primary-400 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              {generateTaemyeong.isPending ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Heart className="w-5 h-5" />}
              태명 추천받기
            </button>
          </form>
        </motion.div>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-5 shadow-md flex items-center gap-4">
                <div className="text-3xl">{getElementEmoji(t.element || 'wood')}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{t.name}</h3>
                  <p className="text-sm text-gray-500">{t.meaning}</p>
                </div>
                <div className="ml-auto w-3 h-3 rounded-full" style={{ backgroundColor: getElementColor(t.element || 'wood') }} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
