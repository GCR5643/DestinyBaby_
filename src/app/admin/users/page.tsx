'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type SortKey = '가입일순' | '크레딧순' | '뽑기순';

interface User {
  id: number;
  nickname: string;
  email: string;
  credits: number;
  total_pulls: number;
  joined: string;
  initial: string;
  color: string;
}

const MOCK_USERS: User[] = [
  { id: 1, nickname: '행운아민준', email: 'minjun@example.com', credits: 15000, total_pulls: 243, joined: '2024-01-01', initial: '민', color: '#a29bfe' },
  { id: 2, nickname: '새댁엄마', email: 'newmom@example.com', credits: 8500, total_pulls: 87, joined: '2024-01-05', initial: '새', color: '#fd79a8' },
  { id: 3, nickname: '통계덕후', email: 'stats@example.com', credits: 32000, total_pulls: 512, joined: '2023-12-20', initial: '통', color: '#F9CA24' },
  { id: 4, nickname: '도사님', email: 'dosa@example.com', credits: 5000, total_pulls: 45, joined: '2024-01-10', initial: '도', color: '#e17055' },
  { id: 5, nickname: '그림쟁이수아', email: 'sua@example.com', credits: 22000, total_pulls: 180, joined: '2023-12-15', initial: '수', color: '#00b894' },
  { id: 6, nickname: '신규유저123', email: 'new123@example.com', credits: 1000, total_pulls: 10, joined: '2024-01-14', initial: '신', color: '#74b9ff' },
  { id: 7, nickname: '화난유저99', email: 'angry@example.com', credits: 3000, total_pulls: 28, joined: '2024-01-12', initial: '화', color: '#ff7675' },
  { id: 8, nickname: '스팸봇001', email: 'spam@example.com', credits: 0, total_pulls: 0, joined: '2024-01-15', initial: '스', color: '#b2bec3' },
];

export default function UsersPage() {
  const router = useRouter();
  const [users] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('가입일순');
  const [creditInputs, setCreditInputs] = useState<Record<number, string>>({});
  const [activeCredit, setActiveCredit] = useState<number | null>(null);

  const filtered = users
    .filter((u) => u.nickname.includes(search) || u.email.includes(search))
    .sort((a, b) => {
      if (sort === '크레딧순') return b.credits - a.credits;
      if (sort === '뽑기순') return b.total_pulls - a.total_pulls;
      return new Date(b.joined).getTime() - new Date(a.joined).getTime();
    });

  const handleGrant = (user: User) => {
    const amount = creditInputs[user.id];
    if (!amount || isNaN(Number(amount))) { alert('금액을 입력하세요'); return; }
    alert(`지급 완료: ${user.nickname}에게 ${Number(amount).toLocaleString()} 크레딧 지급`);
    setCreditInputs((prev) => ({ ...prev, [user.id]: '' }));
    setActiveCredit(null);
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
                    className="bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors"
                  >
                    지급
                  </button>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">검색 결과가 없습니다</div>
          )}
        </div>
      </div>
    </div>
  );
}
