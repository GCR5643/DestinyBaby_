'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, AlertCircle, Check } from 'lucide-react';

type LoadingProvider = 'kakao' | 'google' | 'email' | null;

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<LoadingProvider>(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleOAuth = async (provider: 'google' | 'kakao') => {
    setLoadingProvider(provider);
    setError('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
      });
      if (error) {
        setError(error.message);
        setLoadingProvider(null);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      setLoadingProvider(null);
    }
  };

  const handleMagicLink = async () => {
    if (!email || !email.includes('@')) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    setLoadingProvider('email');
    setError('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
      });
      if (error) {
        setError(error.message);
        setLoadingProvider(null);
        return;
      }
      setMagicLinkSent(true);
      setLoadingProvider(null);
    } catch {
      setError('메일 전송에 실패했습니다. 다시 시도해주세요.');
      setLoadingProvider(null);
    }
  };

  const handleGuest = () => {
    document.cookie = 'destiny-baby-guest=true; path=/; Max-Age=3600';
    router.push(redirectTo);
  };

  const isLoading = loadingProvider !== null;

  // 매직링크 전송 완료 화면
  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col">
        {/* 상단 장식 영역 */}
        <div className="relative overflow-hidden pt-16 pb-12 px-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-100/40 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute top-20 left-8 w-1.5 h-1.5 bg-gold-400/30 rounded-full" />
          <div className="absolute top-32 right-12 w-1 h-1 bg-gold-400/20 rounded-full" />
          <div className="absolute top-16 right-24 w-2 h-2 bg-gold-400/25 rounded-full" />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 -mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm text-center"
          >
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-9 h-9 text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">메일함을 확인해주세요</h1>
            <p className="text-gray-500 text-sm mb-2">
              <span className="font-semibold text-primary-600">{email}</span>
            </p>
            <p className="text-gray-400 text-sm mb-8">
              로그인 링크를 보냈어요. 메일의 링크를 클릭하면<br />자동으로 로그인됩니다.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => { setMagicLinkSent(false); setEmail(''); }}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                다른 이메일로 시도
              </button>
              <button
                onClick={handleGuest}
                className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
              >
                계정 없이 둘러보기 →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* 상단 브랜드 영역 — 피그마 킷 2단 분리 구조 */}
      <div className="relative overflow-hidden pt-14 pb-10 px-6">
        {/* 배경 장식: 라벤더 블러 원 + 금색 별 도트 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-100/40 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-12 left-10 w-1.5 h-1.5 bg-gold-400/30 rounded-full" />
        <div className="absolute top-8 right-16 w-1 h-1 bg-gold-400/20 rounded-full" />
        <div className="absolute top-24 right-8 w-2 h-2 bg-gold-400/25 rounded-full" />
        <div className="absolute top-20 left-[30%] w-1 h-1 bg-gold-400/15 rounded-full" />
        <div className="absolute top-6 left-[60%] w-1.5 h-1.5 bg-gold-400/20 rounded-full" />
        <div className="absolute top-28 left-16 w-1 h-1 bg-gold-400/25 rounded-full" />
        <div className="absolute top-14 right-[35%] w-1.5 h-1.5 bg-gold-400/15 rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative text-center"
        >
          <div className="text-4xl mb-3">✨</div>
          <h1 className="text-3xl font-bold text-gray-800">운명의 아이</h1>
          <p className="text-primary-500 text-sm mt-1.5">우리 아이의 특별한 이름을 찾아요</p>
        </motion.div>
      </div>

      {/* 로그인 카드 */}
      <div className="flex-1 px-5 -mt-2">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-sm mx-auto bg-white rounded-3xl p-7 shadow-[0_10px_40px_rgba(108,92,231,0.12)] border border-primary-100/50"
        >
          {/* 이메일 매직링크 섹션 */}
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-800 mb-1">로그인</h2>
            <p className="text-xs text-gray-400">이메일로 간편하게 시작하세요</p>
          </div>

          <div className="space-y-3 mb-5">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="이메일 주소"
                disabled={isLoading}
                onKeyDown={e => e.key === 'Enter' && handleMagicLink()}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary-400 focus:bg-white transition-all placeholder:text-gray-400 disabled:opacity-50"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMagicLink}
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white bg-primary-500 hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingProvider === 'email' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  로그인 링크 받기
                </>
              )}
            </motion.button>
          </div>

          {/* 에러 메시지 */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 구분선 — "Or continue with" 패턴 */}
          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 whitespace-nowrap">간편 로그인</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* 소셜 로그인 — 피그마 킷의 아이콘 박스 패턴 */}
          <div className="flex gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleOAuth('kakao')}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50"
              style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
            >
              {loadingProvider === 'kakao' ? (
                <div className="w-4 h-4 border-2 border-[#3C1E1E]/30 border-t-[#3C1E1E] rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1.5C4.86 1.5 1.5 4.14 1.5 7.38C1.5 9.48 2.88 11.31 4.95 12.33L4.14 15.27C4.08 15.48 4.32 15.66 4.5 15.54L7.92 13.2C8.28 13.23 8.64 13.26 9 13.26C13.14 13.26 16.5 10.62 16.5 7.38C16.5 4.14 13.14 1.5 9 1.5Z" fill="#3C1E1E"/>
                </svg>
              )}
              카카오
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleOAuth('google')}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-sm border-2 border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {loadingProvider === 'google' ? (
                <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              )}
              Google
            </motion.button>
          </div>

          {/* 게스트 — 텍스트 링크로 격하 */}
          <div className="text-center">
            <button
              onClick={handleGuest}
              className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
            >
              계정 없이 둘러보기 →
            </button>
          </div>
        </motion.div>

        {/* 이용약관 — 카드 바깥 */}
        <div className="max-w-sm mx-auto pt-5 pb-8 text-center">
          <p className="text-xs text-gray-400">
            시작하면{' '}
            <Link href="/terms" className="text-primary-500 hover:underline">이용약관</Link>
            과{' '}
            <Link href="/privacy" className="text-primary-500 hover:underline">개인정보처리방침</Link>
            에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
