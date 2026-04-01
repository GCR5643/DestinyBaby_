'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gem, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useUserStore } from '@/stores/userStore';
import TransactionItem from '@/components/wallet/TransactionItem';
import { useRouter } from 'next/navigation';
import { SKIP_AUTH } from '@/lib/auth/skip-auth';

const FRAGMENT_PACKS = [
  { id: 'handful' as const, name: '한 줌', fragments: 10, price: 1200, discount: null },
  { id: 'pouch' as const, name: '작은 보따리', fragments: 30, price: 3000, discount: null },
  { id: 'pouch_large' as const, name: '복주머니', fragments: 100, price: 8000, discount: '20%↓' },
  { id: 'golden_jar' as const, name: '황금 항아리', fragments: 300, price: 20000, discount: '33%↓' },
];

type TabType = 'all' | 'earn' | 'spend';

export default function WalletPage() {
  const router = useRouter();
  const { user, updateFragments } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Balance
  const { data: balanceData, refetch: refetchBalance } = trpc.fragments.getBalance.useQuery(
    undefined,
    { enabled: !!user || SKIP_AUTH }
  );

  // Transaction history
  const { data: historyData } = trpc.fragments.getHistory.useQuery(
    { limit: 50 },
    { enabled: !!user || SKIP_AUTH }
  );

  // 결제 주문 생성 → 체크아웃 페이지로 이동
  const createOrder = trpc.fragments.createOrder.useMutation({
    onSuccess: (data) => {
      const params = new URLSearchParams({
        orderId: data.orderId,
        amount: String(data.amount),
        orderName: data.orderName,
        customerKey: user?.id || 'anonymous',
      });
      router.push(`/wallet/checkout?${params.toString()}`);
    },
    onError: () => {
      alert('주문 생성에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const fragmentBalance = balanceData?.fragments ?? user?.destiny_fragments ?? 0;
  const transactions = historyData?.transactions ?? [];

  const filteredTransactions = transactions.filter((t: { amount: number }) => {
    if (activeTab === 'earn') return t.amount > 0;
    if (activeTab === 'spend') return t.amount < 0;
    return true;
  });

  if (!user && !SKIP_AUTH) {
    return (
      <div className="min-h-screen bg-ivory pb-24 flex flex-col items-center justify-center px-4">
        <Gem className="w-16 h-16 text-purple-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-800 mb-2">운명의 조각</h1>
        <p className="text-gray-500 text-sm text-center mb-6">로그인 후 이용 가능합니다</p>
        <button
          onClick={() => router.push('/login?redirect=/wallet')}
          className="bg-primary-500 text-white px-6 py-3 rounded-xl font-bold text-sm"
        >
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header with balance */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 pt-12 pb-8 px-4 text-center text-white">
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 text-white/80 hover:text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Gem className="w-10 h-10 mx-auto mb-3 text-yellow-300" />
        <h1 className="text-2xl font-bold mb-1">운명의 조각</h1>
        <div className="inline-flex items-center gap-2 mt-2 bg-white/10 rounded-full px-5 py-2.5">
          <Gem className="w-5 h-5 text-yellow-300" />
          <span className="text-3xl font-black">{fragmentBalance.toLocaleString()}</span>
          <span className="text-sm text-white/70">개 보유</span>
        </div>
        <p className="text-white/60 text-xs mt-2">출석 체크로 무료 획득 · 오늘의 운수에 사용</p>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {/* Quick charge section */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">💎 조각 충전</h2>
          <div className="space-y-2.5">
            {FRAGMENT_PACKS.map((pack, i) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-gray-800">{pack.name}</div>
                  <div className="flex items-center gap-1.5">
                    <Gem className="w-4 h-4 text-purple-500" />
                    <span className="text-purple-600 font-black text-lg">{pack.fragments}</span>
                    <span className="text-gray-400 text-xs">조각</span>
                    {pack.discount && (
                      <span className="text-xs bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded-full ml-1">
                        {pack.discount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    개당 {Math.round(pack.price / pack.fragments)}원
                  </div>
                </div>
                <button
                  onClick={() => createOrder.mutate({ packageId: pack.id })}
                  disabled={createOrder.isPending}
                  className="bg-purple-500 text-white py-2.5 px-5 rounded-xl font-bold text-sm hover:bg-purple-600 transition disabled:opacity-50"
                >
                  {createOrder.isPending ? '...' : `${pack.price.toLocaleString()}원`}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transaction history */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">거래 내역</h2>

          {/* Tab filters */}
          <div className="flex gap-2 mb-3">
            {([
              { key: 'all' as TabType, label: '전체' },
              { key: 'earn' as TabType, label: '획득' },
              { key: 'spend' as TabType, label: '사용' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                거래 내역이 없어요
              </p>
            ) : (
              filteredTransactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  amount={tx.amount}
                  type={tx.type}
                  description={tx.description}
                  balanceAfter={tx.balance_after}
                  createdAt={tx.created_at}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
