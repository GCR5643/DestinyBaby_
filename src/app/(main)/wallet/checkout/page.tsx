'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadPaymentWidget, type PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { ArrowLeft } from 'lucide-react';

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'sb_publishable_WDe1riUtngM_5nn9rOLwdA_tNDvlo40';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const amount = Number(searchParams.get('amount') || '0');
  const orderName = searchParams.get('orderName') || '운명의 조각';
  const customerKey = searchParams.get('customerKey') || 'anonymous';

  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!orderId || !amount) return;

    (async () => {
      const widget = await loadPaymentWidget(CLIENT_KEY, customerKey);
      paymentWidgetRef.current = widget;

      await widget.renderPaymentMethods('#payment-methods', { value: amount });
      widget.renderAgreement('#payment-agreement', { variantKey: 'AGREEMENT' });

      setIsReady(true);
    })();
  }, [orderId, amount, customerKey]);

  const handlePayment = async () => {
    if (!paymentWidgetRef.current || isProcessing) return;
    setIsProcessing(true);

    try {
      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/wallet/success`,
        failUrl: `${window.location.origin}/wallet/fail`,
      });
    } catch {
      setIsProcessing(false);
    }
  };

  if (!orderId || !amount) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h1 className="text-lg font-bold text-gray-800 mb-2">잘못된 접근이에요</h1>
          <button onClick={() => router.push('/wallet')} className="text-primary-600 font-medium underline">
            지갑으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">결제하기</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <h2 className="font-bold text-gray-800 mb-2">주문 정보</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{orderName}</span>
            <span className="font-bold text-gray-800">{amount.toLocaleString()}원</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div id="payment-methods" className="min-h-[300px]" />
          <div id="payment-agreement" />
        </div>

        <button
          onClick={handlePayment}
          disabled={!isReady || isProcessing}
          className="w-full mt-4 bg-blue-500 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              결제 처리 중...
            </>
          ) : (
            `${amount.toLocaleString()}원 결제하기`
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          결제는 토스페이먼츠를 통해 안전하게 처리됩니다
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory flex items-center justify-center"><p>로딩중...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
