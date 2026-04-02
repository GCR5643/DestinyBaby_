'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

const CATEGORIES = [
  { id: 'naming' as const, label: '✏️ 작명이야기' },
  { id: 'saju' as const, label: '🔮 사주이야기' },
  { id: 'pregnancy' as const, label: '🤰 임신/출산' },
  { id: 'parenting' as const, label: '👨‍👩‍👧 육아' },
  { id: 'free' as const, label: '💬 자유게시판' },
  { id: 'shopping', label: '🛒 쇼핑' },
];

export default function WritePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]['id'] | ''>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const createPost = trpc.community.createPost.useMutation({
    onSuccess: () => {
      router.push('/community');
    },
  });

  const handleSubmit = () => {
    if (!selectedCategory || !content.trim()) return;
    createPost.mutate({
      category: selectedCategory as 'naming' | 'saju' | 'pregnancy' | 'parenting' | 'free',
      title: title.trim() || undefined,
      content: content.trim(),
    });
  };

  const isValid = selectedCategory !== '' && content.trim().length > 0;

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-30 shadow-sm flex items-center gap-3">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1">글쓰기</h1>
        <button
          onClick={handleSubmit}
          disabled={!isValid || createPost.isPending}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            isValid && !createPost.isPending
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {createPost.isPending ? '게시 중...' : '게시하기'}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
        {/* Category selector */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">카테고리 선택</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title input */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">제목 <span className="text-gray-400 font-normal">(선택)</span></p>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value.slice(0, 50))}
            placeholder="제목을 입력하세요"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400"
          />
          <p className="text-right text-xs text-gray-400 mt-1">{title.length}/50</p>
        </div>

        {/* Content textarea */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">내용 <span className="text-red-400">*</span></p>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value.slice(0, 2000))}
            placeholder="내용을 입력하세요 (최대 2000자)"
            rows={10}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 resize-none"
          />
          <p className="text-right text-xs text-gray-400 mt-1">{content.length}/2000</p>
        </div>

        {createPost.isError && (
          <p className="text-sm text-red-500 text-center">게시 중 오류가 발생했습니다. 다시 시도해주세요.</p>
        )}
      </div>
    </div>
  );
}
