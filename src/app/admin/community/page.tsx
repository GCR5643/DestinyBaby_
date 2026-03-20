'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['전체', '자유', '작명후기', '카드자랑', '운세토크', '질문', '공략', '팬아트', '이벤트'];

interface Post {
  id: number;
  title: string;
  category: string;
  nickname: string;
  created_at: string;
  likes: number;
  comments: number;
  reported: boolean;
  hidden: boolean;
}

const MOCK_POSTS: Post[] = [
  { id: 1, title: '이 앱 사기 아님? 환불 요청합니다', category: '자유', nickname: '화난유저99', created_at: '2024-01-15 09:12', likes: 2, comments: 14, reported: true, hidden: false },
  { id: 2, title: '광고성 링크 공유합니다', category: '이벤트', nickname: '스팸봇001', created_at: '2024-01-15 08:45', likes: 0, comments: 0, reported: true, hidden: false },
  { id: 3, title: 'SSS 청룡 뽑았어요!! 대박!', category: '카드자랑', nickname: '행운아민준', created_at: '2024-01-15 11:30', likes: 87, comments: 23, reported: false, hidden: false },
  { id: 4, title: '제 아이 이름 작명 후기 공유해요', category: '작명후기', nickname: '새댁엄마', created_at: '2024-01-14 20:15', likes: 45, comments: 12, reported: false, hidden: false },
  { id: 5, title: '가챠 확률 진짜인가요? 검증해봤습니다', category: '공략', nickname: '통계덕후', created_at: '2024-01-14 18:00', likes: 132, comments: 44, reported: false, hidden: false },
  { id: 6, title: '사주 봐드립니다 (무료)', category: '운세토크', nickname: '도사님', created_at: '2024-01-14 15:30', likes: 28, comments: 9, reported: false, hidden: false },
  { id: 7, title: '청룡 팬아트 그려봤어요 🐉', category: '팬아트', nickname: '그림쟁이수아', created_at: '2024-01-13 22:10', likes: 210, comments: 31, reported: false, hidden: false },
  { id: 8, title: '첫 뽑기 10연차 결과 인증', category: '자유', nickname: '신규유저123', created_at: '2024-01-13 14:05', likes: 19, comments: 6, reported: false, hidden: false },
];

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [activeCategory, setActiveCategory] = useState('전체');
  const [search, setSearch] = useState('');

  const reportedPosts = posts.filter((p) => p.reported && !p.hidden);
  const filteredPosts = posts.filter((p) => {
    if (p.reported) return false;
    const matchCat = activeCategory === '전체' || p.category === activeCategory;
    const matchSearch = p.title.includes(search) || p.nickname.includes(search);
    return matchCat && matchSearch && !p.hidden;
  });

  const hidePost = (id: number) => {
    alert('게시물을 숨겼습니다');
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, hidden: true } : p)));
  };

  const deletePost = (id: number) => {
    alert('게시물을 삭제했습니다');
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const totalPosts = posts.length;
  const todayNew = 5;
  const reportedCount = posts.filter((p) => p.reported).length;

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
            { label: '총 게시물', value: totalPosts, color: 'text-gray-800' },
            { label: '오늘 신규', value: todayNew, color: 'text-blue-600' },
            { label: '신고 게시물', value: reportedCount, color: 'text-orange-500' },
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

        {/* Reported posts */}
        {reportedPosts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-orange-100 bg-orange-50 flex items-center gap-2">
              <span className="bg-orange-500 text-white text-xs font-black px-2 py-0.5 rounded-full">신고</span>
              <span className="text-sm font-bold text-orange-700">신고된 게시물 ({reportedPosts.length})</span>
            </div>
            {reportedPosts.map((post) => (
              <PostRow key={post.id} post={post} onHide={hidePost} onDelete={deletePost} />
            ))}
          </div>
        )}

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
          {filteredPosts.length === 0 ? (
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

function PostRow({ post, onHide, onDelete }: { post: Post; onHide: (id: number) => void; onDelete: (id: number) => void }) {
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
