'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type SortKey = '가입일순' | '크레딧순' | '뽑기순';

interface User {
  id: string;
  nickname: string;
  email: string;
  credits: number;
  total_pulls: number;
  joined: string;
  initial: string;
  color: string;
}

const AVATAR_COLORS = [
  '#a29bfe', '#fd79a8', '#F9CA24', '#e17055',
  '#00b894', '#74b9ff', '#ff7675', '#b2bec3',
];

function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('가입일순');
  const [creditInputs, setCreditInputs] = useState<Record<string, string>>({});
  const [activeCredit, setActiveCredit] = useState<string | null>(null);
  const [grantingId, setGrantingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, nickname, email, credits, total_pulls, created_at');
      if (error) throw error;

      const mapped: User[] = (data ?? []).map((row: {
        id: string;
        nickname: string | null;
        email: string | null;
        credits: number | null;
        total_pulls: number | null;
        created_at: string | null;
      }) => ({
        id: row.id,
        nickname: row.nickname ?? '(닉네임 없음)',
        email: row.email ?? '',
        credits: row.credits ?? 0,
        total_pulls: row.total_pulls ?? 0,
        joined: row.created_at ? row.created_at.slice(0, 10) : '',
        initial: (row.nickname ?? '?')[0],
        color: colorForId(row.id),
      }));
      setUsers(mapped);
    } catch {
      // fallback: keep empty list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users
    .filter((u) => u.nickname.includes(search) || u.email.includes(search))
    .sort((a, b) => {
      if (sort === '크레딧순') return b.credits - a.credits;
      if (sort === '뽑기순') return b.total_pulls - a.total_pulls;
      return new Date(b.joined).getTime() - new Date(a.joined).getTime();
    });

  const handleGrant = async (user: User) => {
    const amountStr = creditInputs[user.id];
    const amount = Number(amountStr);
    if (!amountStr || isNaN(amount) || amount <= 0) {
      alert('금액을 입력하세요');
      return;
    }

    setGrantingId(user.id);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('users')
        .update({ credits: user.credits + amount })
        .eq('id', user.id);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, credits: u.credits + amount } : u))
      );
      alert(`지급 완료: ${user.nickname}에게 ${amount.toLocaleString()} 크레딧 지급`);
      setCreditInputs((prev) => ({ ...prev, [user.id]: '' }));
      setActiveCredit(null);
    } catch {
      alert('크레딧 지급 중 오류가 발생했습니다');
    } finally {
      setGrantingId(null);
    }
  };

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
        <div className="flex-1">
          <h1 className="text-lg font-black text-gray-800">회원 관리</h1>
          <p className="text-xs text-gray-400">총 {users.length}명</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* Search + Sort */}
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이메일 또는 닉네임 검색"
            className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-white border border-gray-200 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
          >
            {(['가입일순', '크레딧순', '뽑기순'] as SortKey[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* User list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">불러오는 중...</div>
          ) : (
            <>
              {filtered.map((user) => (
                <div key={user.id} className="px-4 py-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.initial}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 text-sm">{user.nickname}</span>
                      </div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>💰 {user.credits.toLocaleString()} cr</span>
                        <span>🃏 {user.total_pulls}회</span>
                        <span>📅 {user.joined}</span>
                      </div>
                    </div>

                    {/* Credit grant button */}
                    <button
                      onClick={() => setActiveCredit(activeCredit === user.id ? null : user.id)}
                      className="text-xs bg-green-500 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-green-600 transition-colors flex-shrink-0"
                    >
                      크레딧 지급
                    </button>
                  </div>

                  {/* Inline credit input */}
                  {activeCredit === user.id && (
                    <div className="mt-3 flex gap-2 pl-13">
                      <input
                        type="number"
                        value={creditInputs[user.id] ?? ''}
                        onChange={(e) => setCreditInputs((prev) => ({ ...prev, [user.id]: e.target.value }))}
                        placeholder="지급할 크레딧 수량"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        min={1}
                      />
                      <button
                        onClick={() => handleGrant(user)}
                        disabled={grantingId === user.id}
                        className="bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {grantingId === user.id ? '처리중...' : '지급'}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-sm">검색 결과가 없습니다</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
