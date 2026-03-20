'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Search, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import type { QuickReview } from '@/types';

interface ReviewForm {
  name: string;
  hanja: string;
  birthDate: string;
  birthTime: string;
}

export default function NamingReviewPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuickReview | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<ReviewForm>();
  const reviewName = trpc.naming.reviewName.useMutation();

  const onSubmit = async (data: ReviewForm) => {
    const review = await reviewName.mutateAsync({
      name: data.name,
      hanja: data.hanja || undefined,
      birthDate: data.birthDate,
      birthTime: data.birthTime || undefined,
    });
    setResult(review);
  };

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-gradient-to-br from-primary-500 to-secondary-400 pt-12 pb-8 px-4 text-white text-center">
        <Search className="w-8 h-8 mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-1">이름 검수</h1>
        <p className="text-sm opacity-80">이미 지은 이름이 사주에 맞는지 확인해드려요</p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">이름 *</label>
                <input {...register('name', { required: true })} placeholder="예: 지우" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">한자</label>
                <input {...register('hanja')} placeholder="예: 智宇" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">아기 생년월일 *</label>
                <input type="date" {...register('birthDate', { required: true })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">태어난 시간</label>
                <input type="time" {...register('birthTime')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" />
              </div>
            </div>
            <button type="submit" disabled={reviewName.isPending} className="w-full bg-gradient-to-r from-primary-500 to-primary-400 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              {reviewName.isPending ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
              이름 검수하기
            </button>
          </form>
        </motion.div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-primary-500" />
              <h2 className="font-bold text-gray-800">검수 결과</h2>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl font-bold text-primary-600">{result.fitScore}</div>
              <div>
                <div className="text-sm font-medium text-gray-700">사주 적합도</div>
                <div className="h-2 w-32 bg-gray-100 rounded-full mt-1">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${result.fitScore}%` }} />
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{result.comment}</p>
            {result.shouldPullCard && (
              <button onClick={() => router.push('/cards')} className="w-full bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-3 rounded-2xl text-sm font-bold">
                🃏 {result.cardPullMessage}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
