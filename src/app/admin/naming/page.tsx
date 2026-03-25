'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NamingStat {
  period: string;
  requests: number;
  reports: number;
  revenue: string;
}

interface TopName {
  name: string;
  hanja: string;
  count: number;
}

const FALLBACK_STATS: NamingStat[] = [
  { period: '오늘', requests: 0, reports: 0, revenue: '₩0' },
  { period: '이번주', requests: 0, reports: 0, revenue: '₩0' },
  { period: '이번달', requests: 0, reports: 0, revenue: '₩0' },
];

export default function AdminNamingPage() {
  const [stats, setStats] = useState<NamingStat[]>(FALLBACK_STATS);
  const [topNames, setTopNames] = useState<TopName[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      try {
        const now = new Date();

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [todayRes, weekRes, monthRes, reportsRes, topNamesRes] = await Promise.all([
          supabase
            .from('naming_requests')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', startOfToday.toISOString()),
          supabase
            .from('naming_requests')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', startOfWeek.toISOString()),
          supabase
            .from('naming_requests')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', startOfMonth.toISOString()),
          supabase
            .from('naming_reports')
            .select('id, created_at'),
          supabase
            .from('naming_requests')
            .select('suggested_name, hanja')
            .not('suggested_name', 'is', null),
        ]);

        const reports = reportsRes.data ?? [];
        const todayReports = reports.filter(
          (r: { created_at: string }) => new Date(r.created_at) >= startOfToday
        ).length;
        const weekReports = reports.filter(
          (r: { created_at: string }) => new Date(r.created_at) >= startOfWeek
        ).length;
        const monthReports = reports.filter(
          (r: { created_at: string }) => new Date(r.created_at) >= startOfMonth
        ).length;

        setStats([
          { period: '오늘', requests: todayRes.count ?? 0, reports: todayReports, revenue: '₩-' },
          { period: '이번주', requests: weekRes.count ?? 0, reports: weekReports, revenue: '₩-' },
          { period: '이번달', requests: monthRes.count ?? 0, reports: monthReports, revenue: '₩-' },
        ]);

        // Aggregate top names from suggested_name column
        const nameMap: Record<string, { hanja: string; count: number }> = {};
        for (const row of (topNamesRes.data ?? []) as { suggested_name: string | null; hanja: string | null }[]) {
          const name = row.suggested_name;
          if (!name) continue;
          if (!nameMap[name]) {
            nameMap[name] = { hanja: row.hanja ?? '', count: 0 };
          }
          nameMap[name].count += 1;
        }
        const sorted = Object.entries(nameMap)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 5)
          .map(([name, val]) => ({ name, hanja: val.hanja, count: val.count }));
        setTopNames(sorted);
      } catch {
        // fallback: keep zeros
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-primary-600 pt-8 pb-6 px-4 text-white">
        <h1 className="text-xl font-bold">작명 관리</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-4">
        {/* Stats */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">통계</h2>
          {loading ? (
            <div className="py-6 text-center text-gray-400 text-sm">불러오는 중...</div>
          ) : (
            <div className="space-y-2">
              {stats.map((stat) => (
                <div key={stat.period} className="grid grid-cols-4 text-sm py-2 border-b border-gray-50">
                  <div className="font-medium text-gray-700">{stat.period}</div>
                  <div className="text-center text-gray-600">{stat.requests}건</div>
                  <div className="text-center text-primary-600">{stat.reports}건</div>
                  <div className="text-right font-semibold text-gray-800">{stat.revenue}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top names */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">인기 생성 이름 TOP 5</h2>
          {loading ? (
            <div className="py-6 text-center text-gray-400 text-sm">불러오는 중...</div>
          ) : topNames.length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-sm">데이터가 없습니다</div>
          ) : (
            <div className="space-y-2">
              {topNames.map((n, i) => (
                <div key={n.name} className="flex items-center gap-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">{n.name}</span>
                    {n.hanja && <span className="text-gray-400 text-sm ml-2">{n.hanja}</span>}
                  </div>
                  <div className="text-sm text-gray-500">{n.count}회</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
