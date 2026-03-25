'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = ['전체', '자유', '작명후기', '카드자랑', '운세토크', '질문', '공략', '팬아트', '이벤트'];

interface Post {
  id: string;
  title: string;
  category: string;
  nickname: string;
  created_at: string;
  likes: number;
  comments: number;
  hidden: boolean;
}

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('전체');
  const [search, setSearch] = useState('');
  const [todayNew, setTodayNew] = useState(0);

  const fetchPosts = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('id, title, category, created_at, like_count, comment_count, users(nickname)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let newToday = 0;
      type RawPost = {
        id: string;
        title: string | null;
        category: string;
        created_at: string;
        like_count: number | null;
        comment_count: number | null;
        users: { nickname: string | null } | { nickname: string | null }[] | null;
      };
      const mapped: Post[] = ((data ?? []) as unknown as RawPost[]).map((row) => {
        const usersField = Array.isArray(row.users) ? row.users[0] : row.users;
        if (new Date(row.created_at) >= today) newToday++;
        return {
          id: row.id,
          title: row.title ?? '(제목 없음)',
          category: row.category,
          nickname: usersField?.nickname ?? '(알 수 없음)',
          created_at: row.created_at.slice(0, 16).replace('T', ' '),
          likes: row.like_count ?? 0,
          comments: row.comment_count ?? 0,
          hidden: false,
        };
      });
      setPosts(mapped);
      setTodayNew(newToday);
    } catch {
      // fallback: keep empty list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const hidePost = async (id: string) => {
    // Mark hidden locally (community_posts has no is_hidden column in current schema)
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, hidden: true } : p)));
    alert('게시물을 숨겼습니다');
  };

  const deletePost = async (id: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from('community_posts').delete().eq('id', id);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== id));
      alert('게시물을 삭제했습니다');
    } catch {
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  const visiblePosts = posts.filter((p) => !p.hidden);
  const filteredPosts = visiblePosts.filter((p) => {
    const matchCat = activeCategory === '전체' || p.category === activeCategory;
    const matchSearch = p.title.includes(search) || p.nickname.includes(search);
    return matchCat && matchSearch;
  });

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
        <h1 className="text-lg font-black text-gray-800 flex-1">커뮤니티 관리</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '총 게시물', value: loading ? '-' : visiblePosts.length, color: 'text-gray-800' },
            { label: '오늘 신규', value: loading ? '-' : todayNew, color: 'text-blue-600' },
            { label: '신고 게시물', value: '-', color: 'text-orange-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목 또는 닉네임으로 검색"
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Post list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">불러오는 중...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">게시물이 없습니다</div>
          ) : (
            filteredPosts.map((post) => (
              <PostRow key={post.id} post={post} onHide={hidePost} onDelete={deletePost} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PostRow({
  post,
  onHide,
  onDelete,
}: {
  post: Post;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="px-4 py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
              {post.category}
            </span>
            <span className="text-sm font-bold text-gray-800 truncate">{post.title}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{post.nickname}</span>
            <span>{post.created_at}</span>
            <span>❤️ {post.likes}</span>
            <span>💬 {post.comments}</span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onHide(post.id)}
            className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded-lg font-medium"
          >
            숨기기
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2 py-1 rounded-lg font-medium"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
