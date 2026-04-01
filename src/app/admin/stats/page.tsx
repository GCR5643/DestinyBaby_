'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Period = '오늘' | '이번주' | '이번달';
type Grade = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'SSS';

const GRADE_COLORS: Record<Grade, string> = {
  N: '#95a5a6',
  R: '#4a90d9',
  SR: '#a29bfe',
  SSR: '#F9CA24',
  UR: '#dc2626',
  SSS: '#e17055',
};

const RANK_COLORS = ['#F9CA24', '#b2bec3', '#e17055', '#74b9ff', '#a29bfe'];

interface Metrics {
  revenue: string;
  newUsers: number;
  pulls: number;
  naming: number;
}

interface TopName {
  rank: number;
  name: string;
  count: number;
}

interface GradeDist {
  N: number; R: number; SR: number; SSR: number; UR: number; SSS: number;
}

interface Payment {
  user: string;
  amount: string;
  pack: string;
  time: string;
}

const EMPTY_METRICS: Metrics = { revenue: '₩0', newUsers: 0, pulls: 0, naming: 0 };
const EMPTY_GRADE_DIST: GradeDist = { N: 0, R: 0, SR: 0, SSR: 0, UR: 0, SSS: 0 };

function getPeriodStart(period: Period): Date {
  const now = new Date();
  if (period === '오늘') {
    const d = new Date(now); d.setHours(0, 0, 0, 0); return d;
  }
  if (period === '이번주') {
    const d = new Date(now); d.setDate(now.getDate() - now.getDay()); d.setHours(0, 0, 0, 0); return d;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function StatsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('오늘');
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [gradeData, setGradeData] = useState<GradeDist>(EMPTY_GRADE_DIST);
  const [topNames, setTopNames] = useState<TopName[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (p: Period) => {
    setLoading(true);
    const supabase = createClient();
    const since = getPeriodStart(p).toISOString();

    try {
      const [revenueRes, newUsersRes, pullsRes, namingRes, topNamesRes, paymentsRes, userCardsRes] =
        await Promise.all([
          // Total revenue in period
          supabase
            .from('payment_orders')
            .select('amount')
            .eq('status', 'completed')
            .gte('created_at', since),
          // New users in period
          supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', since),
          // Total pulls (sum from users table — all-time; no per-period breakdown available without gacha log)
          supabase.from('users').select('total_pulls'),
          // Naming requests in period
          supabase
            .from('naming_requests')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', since),
          // Top names in period
          supabase
            .from('naming_requests')
            .select('suggested_name')
            .gte('created_at', since)
            .not('suggested_name', 'is', null),
          // Recent completed payments
          supabase
            .from('payment_orders')
            .select('amount, credits, created_at, users(nickname)')
            .eq('status', 'completed')
            .gte('created_at', since)
            .order('created_at', { ascending: false })
            .limit(5),
          // Grade distribution: cards obtained in period
          supabase
            .from('user_cards')
            .select('cards(grade)')
            .gte('obtained_at', since),
        ]);

      // Revenue
      const totalRevenue = (revenueRes.data ?? []).reduce(
        (sum: number, r: { amount: number }) => sum + (r.amount ?? 0), 0
      );

      // Total pulls (sum across all users — best available)
      const totalPulls = (pullsRes.data ?? []).reduce(
        (sum: number, r: { total_pulls: number | null }) => sum + (r.total_pulls ?? 0), 0
      );

      setMetrics({
        revenue: `₩${totalRevenue.toLocaleString()}`,
        newUsers: newUsersRes.count ?? 0,
        pulls: totalPulls,
        naming: namingRes.count ?? 0,
      });

      // Top names
      const nameMap: Record<string, number> = {};
      for (const row of (topNamesRes.data ?? []) as { suggested_name: string | null }[]) {
        if (!row.suggested_name) continue;
        nameMap[row.suggested_name] = (nameMap[row.suggested_name] ?? 0) + 1;
      }
      const sorted = Object.entries(nameMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count], i) => ({ rank: i + 1, name, count }));
      setTopNames(sorted);

      // Payments
      type RawPayment = {
        amount: number;
        credits: number;
        created_at: string;
        users: { nickname: string | null } | { nickname: string | null }[] | null;
      };
      const mappedPayments: Payment[] = ((paymentsRes.data ?? []) as unknown as RawPayment[]).map((r) => {
        const usersField = Array.isArray(r.users) ? r.users[0] : r.users;
        return {
          user: usersField?.nickname ?? '(알 수 없음)',
          amount: `₩${(r.amount ?? 0).toLocaleString()}`,
          pack: `${r.credits}크레딧`,
          time: r.created_at.slice(0, 16).replace('T', ' '),
        };
      });
      setPayments(mappedPayments);

      // Grade distribution from user_cards joined to cards
      type RawUserCard = { cards: { grade: string } | { grade: string }[] | null };
      const dist: GradeDist = { N: 0, R: 0, SR: 0, SSR: 0, UR: 0, SSS: 0 };
      for (const row of (userCardsRes.data ?? []) as unknown as RawUserCard[]) {
        const cardsField = Array.isArray(row.cards) ? row.cards[0] : row.cards;
        const grade = cardsField?.grade as Grade | undefined;
        if (grade && grade in dist) dist[grade]++;
      }
      setGradeData(dist);
    } catch (error) {
      console.error('[AdminStats] 통계 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(period);
  }, [period, fetchStats]);

  const totalPulls = Object.values(gradeData).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-8 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.push('/admin')}
          className="text-gray-500 hover:text-gray-800 font-medium text-sm"
        >
          ← 뒤로
        </button>
        <h1 className="text-lg font-black text-gray-800 flex-1">통계</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* Period selector */}
        <div className="flex gap-2 bg-white rounded-2xl shadow-sm p-1.5">
          {(['오늘', '이번주', '이번달'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                period === p ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">불러오는 중...</div>
        ) : (
          <>
            {/* Key metrics 2x2 */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '총 매출', value: metrics.revenue, emoji: '💰' },
                { label: '신규 유저', value: `${metrics.newUsers}명`, emoji: '👤' },
                { label: '총 뽑기', value: `${metrics.pulls.toLocaleString()}회`, emoji: '🃏' },
                { label: '작명 요청', value: `${metrics.naming}건`, emoji: '✏️' },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="text-2xl mb-1">{m.emoji}</div>
                  <div className="text-xl font-black text-gray-800">{m.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Grade distribution */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-black text-gray-800 mb-4">등급 분포</h2>
              <div className="space-y-2">
                {(['N', 'R', 'SR', 'SSR', 'UR', 'SSS'] as Grade[]).map((grade) => {
                  const count = gradeData[grade];
                  const pct = totalPulls > 0 ? ((count / totalPulls) * 100).toFixed(1) : '0.0';
                  const width = totalPulls > 0 ? (count / totalPulls) * 100 : 0;
                  return (
                    <div key={grade} className="flex items-center gap-3">
                      <span
                        className="inline-flex items-center justify-center w-10 h-6 rounded-full text-white text-xs font-black flex-shrink-0"
                        style={{ backgroundColor: GRADE_COLORS[grade] }}
                      >
                        {grade}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${width}%`, backgroundColor: GRADE_COLORS[grade] }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right">{count}회 ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top 5 popular names */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-black text-gray-800 mb-4">인기 작명 TOP 5</h2>
              {topNames.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">데이터가 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {topNames.map((item) => (
                    <div key={item.rank} className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: RANK_COLORS[item.rank - 1] ?? '#b2bec3' }}
                      >
                        {item.rank}
                      </span>
                      <span className="flex-1 font-bold text-gray-800 text-sm">{item.name}</span>
                      <span className="text-xs text-gray-400">{item.count}건</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent payments */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <h2 className="font-black text-gray-800">최근 결제</h2>
              </div>
              {payments.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">결제 내역이 없습니다</div>
              ) : (
                payments.map((pay, i) => (
                  <div key={i} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-800">{pay.user}</div>
                      <div className="text-xs text-gray-400">{pay.pack} · {pay.time}</div>
                    </div>
                    <span className="text-sm font-black text-green-600">{pay.amount}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
