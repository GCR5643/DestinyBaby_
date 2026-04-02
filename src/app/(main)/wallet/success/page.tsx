'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gem, CheckCircle2 } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateFragments } = useUserStore();

  const paymentKey = searchParams.get('paymentKey') || '';
  const orderId = searchParams.get('orderId') || '';
  const amount = Number(searchParams.get('amount') || '0');

  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming');
  const [fragments, setFragments] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMessage('결제 정보가 올바르지 않습니다.');
      return;
    }

    const confirm = async () => {
      try {
        const res = await fetch('/api/payments/toss/fragments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setFragments(data.fragments);
          updateFragments(data.fragments);
          setStatus('success');
        } else {
          setErrorMessage(data.error || '결제 승인에 실패했습니다.');
          setStatus('error');
        }
      } catch {
        setErrorMessage('결제 확인 중 오류가 발생했습니다.');
        setStatus('error');
      }
    };

    confirm();
  }, [paymentKey, orderId, amount, updateFragments]);

  if (status === 'confirming') {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">결제 확인 중...</p>
          <p className="text-xs text-gray-400 mt-1">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">😢</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">결제 확인 실패</h1>
          <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/wallet')}
              className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold text-sm"
            >
              지갑으로 돌아가기
            </button>
            <p className="text-xs text-gray-400">
              결제가 되었는데 조각이 충전되지 않았다면<br />
              support@destiny-baby.com으로 문의해주세요
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">충전 완료!</h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-6 py-3 mb-6"
        >
          <Gem className="w-5 h-5 text-purple-500" />
          <span className="text-2xl font-black text-purple-600">{fragments}</span>
          <span className="text-sm text-purple-500">조각 충전됨</span>
        </motion.div>

        <div className="space-y-2 max-w-xs mx-auto">
          <button
            onClick={() => router.push('/wallet')}
            className="w-full bg-purple-500 text-white py-3.5 rounded-xl font-bold text-sm"
          >
            지갑으로 돌아가기
          </button>
          <button
            onClick={() => router.push('/daily-fortune')}
            className="w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-medium text-sm"
          >
            오늘의 운세 보러가기
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory flex items-center justify-center"><div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
