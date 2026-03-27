'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleOAuth = async (provider: 'google' | 'kakao') => {
    setIsLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
      });
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      // createBrowserClient는 자동 리다이렉트를 안 할 수 있음 → 수동 리다이렉트
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    document.cookie = 'destiny-baby-guest=true; path=/; Max-Age=3600';
    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-400 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-2xl font-bold text-white">운명의 아이</h1>
          <p className="text-white/70 text-sm mt-1">우리 아이의 특별한 이름을 찾아요</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-3">
          <button
            onClick={() => handleOAuth('kakao')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm transition-all"
            style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
          >
            <span className="text-lg">💬</span>
            카카오로 시작하기
          </button>

          <button
            onClick={() => handleOAuth('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm border-2 border-gray-200 hover:bg-gray-50 transition-all"
          >
            <span className="text-lg">🔵</span>
            구글로 시작하기
          </button>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <div className="relative flex items-center gap-2 py-1">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            onClick={handleGuest}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-sm border-2 border-dashed border-primary-200 text-primary-600 hover:bg-primary-50 transition-all"
          >
            <span>🌟</span>
            로그인 없이 체험하기
          </button>

          <div className="pt-1 text-center">
            <p className="text-xs text-gray-400">
              시작하면 <Link href="/terms" className="text-primary-600 underline">이용약관</Link>과{' '}
              <Link href="/privacy" className="text-primary-600 underline">개인정보처리방침</Link>에 동의하게 됩니다.
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-white/60 text-sm hover:text-white transition-colors">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
