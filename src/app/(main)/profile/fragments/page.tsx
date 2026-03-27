'use client';

import { motion } from 'framer-motion';
import { Gem, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { trpc } from '@/lib/trpc/client';
import { SKIP_AUTH } from '@/lib/auth/skip-auth';
import Link from 'next/link';

const FRAGMENT_PACKS = [
  { id: 'starter', fragments: 10, price: 1.00, label: '맛보기', badge: null, popular: false },
  { id: 'basic', fragments: 30, price: 2.50, label: '기본', badge: '17%↓', popular: false },
  { id: 'value', fragments: 100, price: 7.00, label: '알뜰', badge: '30%↓', popular: true },
  { id: 'premium', fragments: 300, price: 18.00, label: '넉넉', badge: '40%↓', popular: false },
];

const FEATURES = [
  { emoji: '☀️', title: '오늘의 운수', desc: '매일 사주 기반 맞춤 운세 6종 카드', cost: '1개/회' },
  { emoji: '🔮', title: '상세 사주 리포트', desc: '오행·십성 기반 심층 분석', cost: '5개/회' },
  { emoji: '🃏', title: '운명 카드 뽑기', desc: '사주로 결정되는 특별한 운명 카드', cost: '1개/회' },
];

export default function FragmentsPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { data: balanceData } = trpc.fragments.getBalance.useQuery(undefined, { enabled: !!user || SKIP_AUTH });
  const balance = balanceData?.fragments ?? user?.destiny_fragments ?? 0;

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-primary-500 pt-12 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-white/70 mb-4 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> 돌아가기
          </button>
          <div className="text-center text-white">
            <Gem className="w-12 h-12 mx-auto mb-3 text-purple-200" />
            <h1 className="text-2xl font-bold mb-1">운명의 조각</h1>
            <p className="text-white/70 text-sm mb-4">조각으로 다양한 운명 서비스를 이용하세요</p>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-6 py-3">
              <Gem className="w-5 h-5 text-purple-200" />
              <span className="text-2xl font-black">{balance}</span>
              <span className="text-sm opacity-80">보유 중</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-6">
        {/* 조각 사용처 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            조각 사용처
          </h2>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">{f.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full whitespace-nowrap">
                  {f.cost}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 조각 충전 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-1">조각 충전하기</h2>
          <p className="text-xs text-gray-500 mb-4">기본 10개 = $1 · 많이 살수록 할인!</p>
          <div className="space-y-3">
            {FRAGMENT_PACKS.map((pack) => (
              <motion.button
                key={pack.id}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  pack.popular
                    ? 'border-purple-400 bg-purple-50 shadow-md'
                    : 'border-gray-100 bg-white hover:border-purple-200'
                }`}
                onClick={() => alert('결제 기능은 곧 오픈될 예정이에요! 🚀')}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-primary-400 rounded-xl flex items-center justify-center text-white font-black text-sm">
                  {pack.fragments}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{pack.label}</span>
                    {pack.badge && (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                        {pack.badge}
                      </span>
                    )}
                    {pack.popular && (
                      <span className="text-xs font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                        인기
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{pack.fragments}개 · 개당 ${(pack.price / pack.fragments).toFixed(2)}</p>
                </div>
                <span className="text-lg font-black text-gray-800">${pack.price.toFixed(2)}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 무료 조각 안내 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5">
          <h3 className="font-bold text-gray-800 mb-2">💡 무료로 조각 받는 법</h3>
          <div className="space-y-2">
            {[
              { label: '회원가입', value: '10개', done: !!user },
              { label: '매일 첫 아이 운세', value: '무료', done: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                  {item.done && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={item.done ? 'text-gray-400 line-through' : 'text-gray-700'}>{item.label}</span>
                <span className="ml-auto text-xs font-bold text-amber-600">{item.value}</span>
              </div>
            ))}
          </div>
          {!user && (
            <Link href="/login?redirect=/profile/fragments" className="block mt-3 text-center bg-primary-500 text-white py-2.5 rounded-xl font-bold text-sm">
              회원가입하고 조각 10개 받기
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
