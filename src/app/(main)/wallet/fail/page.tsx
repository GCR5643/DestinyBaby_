'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';
  const message = searchParams.get('message') || '결제가 취소되었거나 실패했습니다.';

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-4">😔</p>
        <h1 className="text-xl font-bold text-gray-800 mb-2">결제 실패</h1>
        <p className="text-sm text-gray-500 mb-2">{message}</p>
        {code && <p className="text-xs text-gray-400 mb-6">오류 코드: {code}</p>}

        <div className="space-y-2">
          <button
            onClick={() => router.push('/wallet')}
            className="w-full bg-primary-500 text-white py-3.5 rounded-xl font-bold text-sm"
          >
            다시 시도하기
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full text-gray-400 py-2 text-sm"
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory flex items-center justify-center"><p>로딩중...</p></div>}>
      <PaymentFailContent />
    </Suspense>
  );
}
