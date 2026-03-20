'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, CreditCard, LogOut, ChevronRight, Heart, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { trpc } from '@/lib/trpc/client';

interface ChildEntry {
  id: string;
  name: string;
  birthDate: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { data: statsData } = trpc.user.getStats.useQuery();

  // Children state
  const [children, setChildren] = useState<ChildEntry[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [childName, setChildName] = useState('');
  const [childBirthDate, setChildBirthDate] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('my-children');
    if (stored) {
      setChildren(JSON.parse(stored));
    }
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const saveChildren = (updated: ChildEntry[]) => {
    setChildren(updated);
    localStorage.setItem('my-children', JSON.stringify(updated));
  };

  const handleAddChild = () => {
    if (!childName) return;
    const newChild: ChildEntry = { id: Date.now().toString(), name: childName, birthDate: childBirthDate };
    saveChildren([...children, newChild]);
    setChildName('');
    setChildBirthDate('');
    setShowAddChild(false);
  };

  const handleDeleteChild = (id: string) => {
    saveChildren(children.filter(c => c.id !== id));
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

        {/* Children Section */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">👶 우리 아이</h2>
            <button
              onClick={() => setShowAddChild(!showAddChild)}
              className="text-xs text-primary-600 font-semibold bg-primary-50 px-3 py-1.5 rounded-full"
            >
              + 자녀 추가
            </button>
          </div>

          {/* Add child form */}
          {showAddChild && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-gray-50 rounded-xl space-y-3"
            >
              <div>
                <label className="text-xs text-gray-500 mb-1 block">이름 (확정 또는 예정)</label>
                <input
                  type="text"
                  value={childName}
                  onChange={e => setChildName(e.target.value)}
                  placeholder="예: 지우, 서연"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">생년월일 (또는 예정일)</label>
                <input
                  type="date"
                  value={childBirthDate}
                  onChange={e => setChildBirthDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  style={{ colorScheme: 'light' }}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddChild} className="flex-1 bg-primary-500 text-white py-2 rounded-xl text-sm font-semibold">추가</button>
                <button onClick={() => setShowAddChild(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm">취소</button>
              </div>
            </motion.div>
          )}

          {children.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">아이 정보를 추가해보세요 👶</p>
          ) : (
            <div className="space-y-3">
              {children.map(child => (
                <div key={child.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm shrink-0">
                    {child.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{child.name}</p>
                    {child.birthDate && (
                      <p className="text-xs text-gray-400">{child.birthDate.replace(/-/g, '.')} 생</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => router.push('/cards')}
                      className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1.5 rounded-full font-semibold"
                    >
                      🃏 카드뽑기
                    </button>
                    <button
                      onClick={() => handleDeleteChild(child.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
