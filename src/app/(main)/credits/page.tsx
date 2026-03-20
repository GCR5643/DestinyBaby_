'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

const CREDIT_PACKS = [
  { id: 'trial' as const, credits: 10, bonus: 0, price: 1900, label: '체험', highlight: false, badge: null },
  { id: 'basic' as const, credits: 30, bonus: 3, price: 4900, label: '기본', highlight: false, badge: '+3 보너스' },
  { id: 'premium' as const, credits: 100, bonus: 15, price: 12900, label: '프리미엄', highlight: true, badge: '+15 + 프레임 1개' },
  { id: 'royal' as const, credits: 300, bonus: 50, price: 29900, label: '로열', highlight: false, badge: '+50 + SS급 보장' },
];

export default function CreditsPage() {
  const { data: balanceData } = trpc.payments.getBalance.useQuery();
  const initiatePurchase = trpc.payments.initiatePurchase.useMutation();

  const handlePurchase = async (pack: typeof CREDIT_PACKS[0]) => {
    try {
      const order = await initiatePurchase.mutateAsync({ packId: pack.id });
      alert(
        `주문 생성 완료!\n` +
        `주문번호: ${order.orderId}\n` +
        `상품명: ${order.orderName}\n` +
        `결제금액: ${order.amount.toLocaleString()}원\n` +
        `크레딧: ${order.credits} + 보너스 ${order.bonus} = 총 ${order.totalCredits} 크레딧`
      );
    } catch (e) {
      alert('구매 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-gradient-to-br from-gold-400 to-gold-500 pt-12 pb-8 px-4 text-center">
        <Zap className="w-8 h-8 mx-auto mb-3 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900 mb-1">크레딧 충전</h1>
        <p className="text-sm text-gray-700">카드 뽑기에 사용하는 크레딧을 충전하세요</p>
        {balanceData !== undefined && (
          <div className="inline-flex items-center gap-2 mt-3 bg-black/10 rounded-full px-4 py-2">
            <span className="font-bold text-gray-900">{(balanceData.credits).toLocaleString()}</span>
            <span className="text-sm text-gray-700">크레딧 보유</span>
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-3">
        {CREDIT_PACKS.map((pack, i) => (
          <motion.div key={pack.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative bg-white rounded-2xl p-5 shadow-md ${pack.highlight ? 'ring-2 ring-primary-400' : ''}`}
          >
            {pack.highlight && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                인기
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-800">{pack.label}</div>
                <div className="text-primary-600 font-black text-xl">
                  {pack.credits.toLocaleString()} 크레딧
                  {pack.bonus > 0 && (
                    <span className="text-sm text-green-500 font-semibold ml-1">+{pack.bonus}</span>
                  )}
                </div>
                {pack.badge && (
                  <div className="text-xs text-green-600 font-medium mt-0.5">{pack.badge}</div>
                )}
                <div className="text-xs text-gray-400 mt-0.5">
                  개당 {Math.round(pack.price / (pack.credits + pack.bonus))}원
                </div>
              </div>
              <button
                onClick={() => handlePurchase(pack)}
                disabled={initiatePurchase.isPending}
                className={`py-2.5 px-5 rounded-xl font-bold text-sm ${pack.highlight ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'} disabled:opacity-50`}
              >
                {pack.price.toLocaleString()}원
              </button>
            </div>
          </motion.div>
        ))}

        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">토스페이먼츠 · 네이버페이 · 카드 결제 가능</p>
        </div>
      </div>
    </div>
  );
}
