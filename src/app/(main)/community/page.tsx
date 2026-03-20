'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';

const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'naming', label: '✏️ 작명이야기' },
  { id: 'saju', label: '🔮 사주이야기' },
  { id: 'education', label: '📚 교육' },
  { id: 'health', label: '💊 건강' },
  { id: 'growth', label: '🌱 성장' },
  { id: 'parenting', label: '👨‍👩‍👧 공동육아' },
  { id: 'shopping', label: '🛒 쇼핑' },
];

function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-gray-200 rounded-full" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded-full ml-auto" />
      </div>
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-full bg-gray-100 rounded mb-1" />
      <div className="h-3 w-2/3 bg-gray-100 rounded" />
      <div className="flex gap-4 mt-3">
        <div className="h-3 w-10 bg-gray-100 rounded" />
        <div className="h-3 w-10 bg-gray-100 rounded" />
        <div className="h-3 w-10 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const router = useRouter();

  const { data, isLoading } = trpc.community.getPosts.useQuery({
    category: activeCategory === 'all' ? undefined : activeCategory,
  });

  const posts = data?.posts ?? [];

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-white pt-12 pb-0 px-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">커뮤니티</h1>
          <Link href="/community/write" className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
          {CATEGORIES.map(cat => (
            <button key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">
        {isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : (
          posts.map((post, i) => (
            <motion.div key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push('/community/' + post.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">
                  {post.user?.nickname?.[0]}
                </div>
                <span className="text-xs text-gray-500">{post.user?.nickname}</span>
                <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full ml-auto">
                  {CATEGORIES.find(c => c.id === post.category)?.label?.replace(/[^\w가-힣\s]/g, '').trim()}
                </span>
              </div>
              {post.title && <h3 className="font-bold text-gray-800 text-sm mb-1">{post.title}</h3>}
              <p className="text-xs text-gray-500 line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span>❤️</span>{post.like_count}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.comment_count}</span>
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{post.view_count}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
