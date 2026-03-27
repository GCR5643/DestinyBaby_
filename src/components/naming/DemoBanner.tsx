'use client';

import { useRouter } from 'next/navigation';
import { LogIn, X } from 'lucide-react';
import { useState } from 'react';

export function DemoBanner() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleLogin = () => {
    document.cookie = 'destiny-baby-guest=; Max-Age=0; path=/';
    router.push('/login?redirect=/naming');
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-primary-600 to-secondary-500 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
        <span className="text-lg flex-shrink-0">✨</span>
        <span className="truncate">
          <span className="font-semibold">게스트 체험 중</span>
          <span className="opacity-80"> — 로그인하면 결과가 저장돼요</span>
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleLogin}
          className="flex items-center gap-1.5 bg-white text-primary-600 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/90 transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          로그인
        </button>
        <button onClick={() => setDismissed(true)} className="opacity-70 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
