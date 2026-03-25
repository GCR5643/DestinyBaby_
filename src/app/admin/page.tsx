'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const ADMIN_SECTIONS = [
  { href: '/admin/naming', title: '작명 관리', emoji: '✏️', desc: '작명 요청/통계/파라미터' },
  { href: '/admin/cards', title: '카드 관리', emoji: '🃏', desc: '카드 등록/수정/삭제' },
  { href: '/admin/probability', title: '확률 관리', emoji: '🎲', desc: '가챠 확률 조정' },
  { href: '/admin/community', title: '커뮤니티 관리', emoji: '💬', desc: '게시물/댓글 모더레이션' },
  { href: '/admin/users', title: '회원 관리', emoji: '👥', desc: '회원 정보/크레딧 관리' },
  { href: '/admin/stats', title: '통계', emoji: '📊', desc: '매출/활성유저/뽑기 통계' },
  { href: '/admin/popularity', title: '유행지수 관리', emoji: '📊', desc: '가중치 · KOSIS 연동' },
];

const FALLBACK_STATS = [
  { label: '오늘 작명 요청', value: '-', change: '' },
  { label: '오늘 매출', value: '-', change: '' },
  { label: '활성 유저', value: '-', change: '' },
  { label: '총 카드 뽑기', value: '-', change: '' },
];

interface StatItem {
  label: string;
  value: string;
  change: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<StatItem[]>(FALLBACK_STATS);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayIso = today.toISOString();

        const [namingRes, usersRes, pullsRes, revenueRes] = await Promise.all([
          supabase
            .from('naming_requests')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', todayIso),
          supabase
            .from('users')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('users')
            .select('total_pulls'),
          supabase
            .from('payment_orders')
            .select('amount')
            .eq('status', 'completed'),
        ]);

        const namingCount = namingRes.count ?? 0;
        const userCount = usersRes.count ?? 0;

        let totalPulls = 0;
        if (pullsRes.data) {
          totalPulls = pullsRes.data.reduce(
            (sum: number, row: { total_pulls: number | null }) => sum + (row.total_pulls ?? 0),
            0
          );
        }

        let totalRevenue = 0;
        if (revenueRes.data) {
          totalRevenue = revenueRes.data.reduce(
            (sum: number, row: { amount: number | null }) => sum + (row.amount ?? 0),
            0
          );
        }

        setStats([
          { label: '오늘 작명 요청', value: String(namingCount), change: '' },
          {
            label: '오늘 매출',
            value: `₩${totalRevenue.toLocaleString()}`,
            change: '',
          },
          { label: '활성 유저', value: userCount.toLocaleString(), change: '' },
          { label: '총 카드 뽑기', value: totalPulls.toLocaleString(), change: '' },
        ]);
      } catch {
        // fallback: keep the placeholder values
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-primary-600 pt-8 pb-6 px-4 text-white">
        <h1 className="text-xl font-bold mb-0.5">관리자 대시보드</h1>
        <p className="text-sm text-white/70">운명의 아이 어드민</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="text-2xl font-black text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              {stat.change && (
                <div className="text-xs text-green-500 font-medium mt-1">{stat.change}</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Sections */}
        <div className="grid grid-cols-2 gap-3">
          {ADMIN_SECTIONS.map((sec, i) => (
            <Link key={sec.href} href={sec.href}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-2">{sec.emoji}</div>
                <h3 className="font-bold text-gray-800 text-sm">{sec.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{sec.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
