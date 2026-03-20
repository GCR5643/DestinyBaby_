'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Search } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useNamingStore } from '@/stores/namingStore';
import { cn } from '@/lib/utils';
import { DemoBanner } from '@/components/naming/DemoBanner';

interface NamingFormData {
  parent1BirthDate: string;
  parent1BirthTime: string;
  parent2BirthDate: string;
  parent2BirthTime: string;
  babyBirthDate: string;
  babyBirthTime: string;
  gender: 'male' | 'female' | 'unknown';
  hangryeolChar: string;
  siblingNames: string;
}

export default function NamingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<NamingFormData>({
    defaultValues: { gender: 'unknown' }
  });
  const generateNames = trpc.naming.generateNames.useMutation();
  const generateNamesPublic = trpc.naming.generateNamesPublic.useMutation();
  const { setParent1Saju, setParent2Saju } = useNamingStore();

  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const guestCookie = cookies.find(c => c.startsWith('destiny-baby-guest='));
    setIsGuest(guestCookie?.split('=')[1] === 'true');
  }, []);

  const onSubmit = async (data: NamingFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        parent1BirthDate: data.parent1BirthDate,
        parent1BirthTime: data.parent1BirthTime || undefined,
        parent2BirthDate: data.parent2BirthDate || undefined,
        parent2BirthTime: data.parent2BirthTime || undefined,
        babyBirthDate: data.babyBirthDate || undefined,
        babyBirthTime: data.babyBirthTime || undefined,
        gender: data.gender,
        hangryeolChar: data.hangryeolChar || undefined,
        siblingNames: data.siblingNames ? data.siblingNames.split(',').map(s => s.trim()) : undefined,
      };

      if (isGuest) {
        const result = await generateNamesPublic.mutateAsync(payload);
        sessionStorage.setItem('guest-naming-result', JSON.stringify(result.names));
        router.push('/naming/result/guest');
      } else {
        const result = await generateNames.mutateAsync(payload);
        router.push(`/naming/result/${result.resultId}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {isGuest && <DemoBanner />}
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-400 to-secondary-400 pt-16 pb-12 px-4 text-center text-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 rounded-full p-4">
              <Sparkles className="w-8 h-8 text-gold-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">AI 작명소</h1>
          <p className="text-base opacity-90 mb-1">사주로 찾아주는 우리 아이 이름</p>
          <p className="text-sm opacity-75">전통 명리학 × 최신 AI 기술</p>
        </motion.div>
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto px-4 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Parent 1 */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">👨 아버지 / 부모1 정보</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">생년월일 *</label>
                  <input
                    type="date"
                    {...register('parent1BirthDate', { required: '필수 입력입니다' })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  />
                  {errors.parent1BirthDate && <p className="text-red-500 text-xs mt-1">{errors.parent1BirthDate.message}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">태어난 시간</label>
                  <input
                    type="time"
                    {...register('parent1BirthTime')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>
              </div>
            </div>

            {/* Parent 2 */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">👩 어머니 / 부모2 정보</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">생년월일</label>
                  <input
                    type="date"
                    {...register('parent2BirthDate')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">태어난 시간</label>
                  <input
                    type="time"
                    {...register('parent2BirthTime')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>
              </div>
            </div>

            {/* Baby */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">👶 아기 정보</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">생년월일 (예정일)</label>
                  <input
                    type="date"
                    {...register('babyBirthDate')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">태어난 시간</label>
                  <input
                    type="time"
                    {...register('babyBirthTime')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="text-xs text-gray-500 mb-2 block">성별</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'male', label: '👦 남자', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { value: 'female', label: '👧 여자', color: 'bg-pink-50 border-pink-200 text-pink-700' },
                    { value: 'unknown', label: '🌟 미정', color: 'bg-purple-50 border-purple-200 text-purple-700' },
                  ].map(opt => (
                    <label key={opt.value} className="cursor-pointer">
                      <input type="radio" value={opt.value} {...register('gender')} className="sr-only" />
                      <div className={cn(
                        'text-center py-2 rounded-xl border-2 text-sm font-medium transition-all',
                        watch('gender') === opt.value ? opt.color + ' ring-2 ring-primary-400' : 'border-gray-200 text-gray-500'
                      )}>
                        {opt.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Options */}
            <details className="group">
              <summary className="cursor-pointer text-sm text-primary-600 font-medium flex items-center gap-1">
                <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                추가 옵션 (항렬, 형제이름)
              </summary>
              <div className="mt-3 space-y-3 pl-5">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">항렬 글자</label>
                  <input
                    type="text"
                    {...register('hangryeolChar')}
                    placeholder="예: 준, 민"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">형제/자매 이름 (쉼표로 구분)</label>
                  <input
                    type="text"
                    {...register('siblingNames')}
                    placeholder="예: 지민, 서연"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>
              </div>
            </details>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-400 text-white py-4 rounded-2xl font-bold text-base shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  AI가 이름을 찾고 있어요...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  이름 추천받기 (무료)
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Review CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-center"
        >
          <button
            onClick={() => router.push('/naming/review')}
            className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-primary-600 transition-colors"
          >
            <Search className="w-4 h-4" />
            이미 이름을 지었나요? 이름 검수하기
          </button>
        </motion.div>
      </div>
    </div>
  );
}
