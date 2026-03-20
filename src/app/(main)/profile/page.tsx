'use client';

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import { Settings, CreditCard, LogOut, ChevronRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { trpc } from '@/lib/trpc/client';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { data: statsData } = trpc.user.getStats.useQuery();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const MENU_ITEMS = [
    { href: '/credits', icon: CreditCard, label: '크레딧 충전', badge: `${user?.credits || 0} 크레딧` },
    { href: '/profile/settings', icon: Settings, label: '설정' },
    { href: '/profile/favorites', icon: Heart, label: '즐겨찾기 카드' },
  ];

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-400 pt-12 pb-12 px-4">
        <div className="flex flex-col items-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mb-3">
            {user?.nickname?.[0] || '✨'}
          </div>
          <h1 className="text-xl font-bold">{user?.nickname || '운명의 아이 사용자'}</h1>
          <p className="text-white/70 text-sm mt-1">{user?.email || ''}</p>
          <div className="flex items-center gap-2 mt-3 bg-white/20 rounded-full px-4 py-2">
            <span className="text-gold-400 font-bold">{(user?.credits || 0).toLocaleString()}</span>
            <span className="text-sm opacity-80">크레딧</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-lg mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-md p-4 grid grid-cols-3 gap-2 mb-4">
          {[
            { label: '총 뽑기', value: statsData?.totalPulls ?? user?.total_pulls ?? 0 },
            { label: '보유 카드', value: statsData?.cardCount ?? 0 },
            { label: '작명 요청', value: statsData?.namingCount ?? 0 },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-black text-primary-600">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          {MENU_ITEMS.map((item, i) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <item.icon className="w-5 h-5 text-gray-500" />
              <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
              {item.badge && <span className="text-xs text-primary-600 font-semibold">{item.badge}</span>}
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </Link>
          ))}
        </div>

        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-red-500 text-sm font-medium bg-white rounded-2xl shadow-sm">
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </div>
  );
}
