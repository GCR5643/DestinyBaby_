'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, CreditCard, LogOut, ChevronRight, Heart, X, Calendar, Sparkles, LogIn, Gem, Users, Check, Pencil, Clock } from 'lucide-react';
import { CozyPanel } from '@/components/cozy';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { useParentStore, type ParentInfo } from '@/stores/parentStore';
import { trpc } from '@/lib/trpc/client';
import { SKIP_AUTH } from '@/lib/auth/skip-auth';

interface ChildEntry {
  id: string;
  name: string;
  birthDate: string;
  birthTime?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthReady } = useUserStore();
  const { dad, mom, setDad, setMom } = useParentStore();
  const { data: statsData } = trpc.user.getStats.useQuery();
  const { data: luckyDatesData } = trpc.birthdate.getMyLuckyDates.useQuery();
  const luckyDateCount = luckyDatesData?.length ?? 0;

  // Children state
  const [children, setChildren] = useState<ChildEntry[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [childName, setChildName] = useState('');
  const [childBirthDate, setChildBirthDate] = useState('');
  const [childBirthTime, setChildBirthTime] = useState('');
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; birthDate: string; birthTime: string }>({ name: '', birthDate: '', birthTime: '' });

  // Parent edit state
  const [showParentEdit, setShowParentEdit] = useState(false);
  const [dadForm, setDadForm] = useState<ParentInfo>({ name: dad?.name || '', birthDate: dad?.birthDate || '', birthTime: dad?.birthTime || '' });
  const [momForm, setMomForm] = useState<ParentInfo>({ name: mom?.name || '', birthDate: mom?.birthDate || '', birthTime: mom?.birthTime || '' });
  const [parentSaved, setParentSaved] = useState(false);

  const handleSaveParents = () => {
    setDad(dadForm.name || dadForm.birthDate ? dadForm : null);
    setMom(momForm.name || momForm.birthDate ? momForm : null);
    setParentSaved(true);
    setTimeout(() => { setParentSaved(false); setShowParentEdit(false); }, 1200);
  };

  useEffect(() => {
    const stored = localStorage.getItem('my-children');
    if (stored) {
      try {
        setChildren(JSON.parse(stored));
      } catch (error) {
        console.error('[Profile] 자녀 정보 로드 실패:', error);
        localStorage.removeItem('my-children');
      }
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
    const newChild: ChildEntry = { id: Date.now().toString(), name: childName, birthDate: childBirthDate, birthTime: childBirthTime || undefined };
    saveChildren([...children, newChild]);
    setChildName('');
    setChildBirthDate('');
    setChildBirthTime('');
    setShowAddChild(false);
  };

  const handleDeleteChild = (id: string) => {
    saveChildren(children.filter(c => c.id !== id));
  };

  const handleStartEdit = (child: ChildEntry) => {
    setEditingChildId(child.id);
    setEditForm({ name: child.name, birthDate: child.birthDate, birthTime: child.birthTime || '' });
  };

  const handleSaveEdit = () => {
    if (!editingChildId || !editForm.name) return;
    saveChildren(children.map(c => c.id === editingChildId ? { ...c, name: editForm.name, birthDate: editForm.birthDate, birthTime: editForm.birthTime || undefined } : c));
    setEditingChildId(null);
  };

  const MENU_SECTIONS = [
    {
      title: '내 아이 관리',
      items: [
        { href: '/profile/lucky-dates', icon: Calendar, label: '내 예비 사주 목록', desc: '길일 관리 · 산부인과 일정 조율', badge: luckyDateCount as number | string | undefined },
        { href: '/naming', icon: Sparkles, label: '이름 추천받기', desc: '사주 기반 AI 작명 · 상세 분석', badge: undefined as number | string | undefined },
        { href: '/profile/favorites', icon: Heart, label: '즐겨찾기 카드', desc: '운명 카드 컬렉션', badge: undefined as number | string | undefined },
      ],
    },
    {
      title: '계정',
      items: [
        { href: '/profile/fragments', icon: Gem, label: '운명의 조각', desc: '충전 · 사용내역 · 과금 안내', badge: `${user?.destiny_fragments || 0}개` as number | string | undefined },
        { href: '/credits', icon: CreditCard, label: '크레딧 충전', desc: undefined as string | undefined, badge: `${user?.credits || 0} 크레딧` as number | string | undefined },
        { href: '/profile/settings', icon: Settings, label: '프로필 · 계정 관리', desc: '닉네임 · 이메일 · 알림 설정', badge: undefined as number | string | undefined },
      ],
    },
  ];

  if (!isAuthReady && !SKIP_AUTH) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-10 h-10 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !SKIP_AUTH) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-full max-w-sm md:max-w-md text-center">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-primary-500" />
          </div>
          <h1 className="font-display text-xl font-bold text-gray-800 mb-2">로그인이 필요해요</h1>
          <p className="text-gray-500 text-sm mb-8">로그인하고 모든 기능을 이용해보세요</p>
          <Button variant="ribbon" size="xl" asChild className="w-full mb-3">
            <Link href="/login?redirect=/profile">카카오 / 구글 로그인</Link>
          </Button>
        </div>
      </div>
    );
  }

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
      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 -mt-6">
        <CozyPanel padding="sm" className="grid grid-cols-3 gap-2 mb-4">
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
        </CozyPanel>

        {/* Parents Section */}
        <CozyPanel padding="sm" className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500" />
              부모 정보
            </h2>
            <button
              onClick={() => setShowParentEdit(!showParentEdit)}
              className="text-xs text-primary-600 font-semibold bg-primary-50 px-3 py-1.5 rounded-full"
            >
              {showParentEdit ? '접기' : (dad || mom) ? '수정' : '입력하기'}
            </button>
          </div>

          {!showParentEdit && !dad && !mom && (
            <p className="text-sm text-gray-400 text-center py-3">
              부모 정보를 입력하면 작명·탄생일·운세에서<br />자동으로 채워져요 ✨
            </p>
          )}

          {!showParentEdit && (dad || mom) && (
            <div className="space-y-2">
              {dad && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-9 h-9 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">👨</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{dad.name || '아빠'}</p>
                    <p className="text-xs text-gray-400">{dad.birthDate?.replace(/-/g, '.')}{dad.birthTime ? ` ${dad.birthTime}` : ''}</p>
                  </div>
                </div>
              )}
              {mom && (
                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                  <div className="w-9 h-9 bg-pink-200 rounded-full flex items-center justify-center text-pink-700 font-bold text-sm">👩</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{mom.name || '엄마'}</p>
                    <p className="text-xs text-gray-400">{mom.birthDate?.replace(/-/g, '.')}{mom.birthTime ? ` ${mom.birthTime}` : ''}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {showParentEdit && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              {/* 아빠 */}
              <div className="p-3 bg-blue-50 rounded-xl space-y-2">
                <p className="text-xs font-bold text-blue-700">👨 아빠 (남편)</p>
                <input type="text" value={dadForm.name} onChange={e => setDadForm({ ...dadForm, name: e.target.value })}
                  placeholder="이름" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary-400" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={dadForm.birthDate} onChange={e => setDadForm({ ...dadForm, birthDate: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary-400" style={{ colorScheme: 'light' }} />
                  <input type="time" value={dadForm.birthTime || ''} onChange={e => setDadForm({ ...dadForm, birthTime: e.target.value })}
                    placeholder="태어난 시간 (선택)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary-400" style={{ colorScheme: 'light' }} />
                </div>
              </div>
              {/* 엄마 */}
              <div className="p-3 bg-pink-50 rounded-xl space-y-2">
                <p className="text-xs font-bold text-pink-700">👩 엄마 (아내)</p>
                <input type="text" value={momForm.name} onChange={e => setMomForm({ ...momForm, name: e.target.value })}
                  placeholder="이름" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary-400" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={momForm.birthDate} onChange={e => setMomForm({ ...momForm, birthDate: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary-400" style={{ colorScheme: 'light' }} />
                  <input type="time" value={momForm.birthTime || ''} onChange={e => setMomForm({ ...momForm, birthTime: e.target.value })}
                    placeholder="태어난 시간 (선택)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary-400" style={{ colorScheme: 'light' }} />
                </div>
              </div>
              <button onClick={handleSaveParents}
                className="w-full bg-primary-500 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                {parentSaved ? <><Check className="w-4 h-4" /> 저장 완료!</> : '저장하기'}
              </button>
            </motion.div>
          )}
        </CozyPanel>

        {/* Children Section */}
        <CozyPanel padding="sm" className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-gray-800">👶 우리 아이</h2>
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
              <div className="grid grid-cols-2 gap-2">
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
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">태어난 시간 (선택)</label>
                  <input
                    type="time"
                    value={childBirthTime}
                    onChange={e => setChildBirthTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
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
                <div key={child.id}>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm shrink-0">
                      {child.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{child.name}</p>
                      <p className="text-xs text-gray-400">
                        {child.birthDate ? child.birthDate.replace(/-/g, '.') : '날짜 미입력'}
                        {child.birthTime ? ` ${child.birthTime}` : ''}
                        {child.birthDate ? ' 생' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => router.push('/cards')}
                        className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1.5 rounded-full font-semibold"
                      >
                        🃏 카드뽑기
                      </button>
                      <button
                        onClick={() => editingChildId === child.id ? setEditingChildId(null) : handleStartEdit(child)}
                        className="text-gray-300 hover:text-primary-500 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChild(child.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {editingChildId === child.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 p-3 bg-primary-50 rounded-xl space-y-2"
                    >
                      <p className="text-xs font-bold text-primary-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 아이 정보 수정
                      </p>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="이름"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary-400"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={editForm.birthDate}
                          onChange={e => setEditForm({ ...editForm, birthDate: e.target.value })}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary-400"
                          style={{ colorScheme: 'light' }}
                        />
                        <input
                          type="time"
                          value={editForm.birthTime}
                          onChange={e => setEditForm({ ...editForm, birthTime: e.target.value })}
                          placeholder="태어난 시간"
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary-400"
                          style={{ colorScheme: 'light' }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSaveEdit} className="flex-1 bg-primary-500 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" /> 저장
                        </button>
                        <button onClick={() => setEditingChildId(null)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm">취소</button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CozyPanel>

        {/* Menu Sections */}
        {MENU_SECTIONS.map(section => (
          <div key={section.title} className="mb-6">
            <h3 className="font-display text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">
              {section.title}
            </h3>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
              {section.items.map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{item.label}</span>
                    {item.desc && <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>}
                  </div>
                  {item.badge !== undefined && item.badge !== 0 && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-bold">
                      {typeof item.badge === 'number' ? `${item.badge}개` : item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-red-500 text-sm font-medium bg-white rounded-2xl shadow-sm mb-4">
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </div>
  );
}
