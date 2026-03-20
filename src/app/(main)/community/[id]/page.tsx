'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Heart, MessageSquare, Send } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: post, isLoading: postLoading } = trpc.community.getPost.useQuery({ id });

  // Sync likeCount from server on first load
  useEffect(() => {
    if (post && likeCount === null) {
      setLikeCount(post.like_count);
    }
  }, [post, likeCount]);

  const { data: comments = [], isLoading: commentsLoading } = trpc.community.getComments.useQuery({ postId: id });

  const toggleLike = trpc.community.toggleLike.useMutation({
    onMutate: () => {
      // optimistic update
      setLiked(prev => {
        const next = !prev;
        setLikeCount(c => (c ?? 0) + (next ? 1 : -1));
        return next;
      });
    },
    onError: () => {
      // revert on error
      setLiked(prev => {
        const next = !prev;
        setLikeCount(c => (c ?? 0) + (next ? 1 : -1));
        return next;
      });
    },
  });

  const addComment = trpc.community.addComment.useMutation({
    onSuccess: () => {
      setCommentText('');
      utils.community.getComments.invalidate({ postId: id });
    },
  });

  const handleLike = () => {
    toggleLike.mutate({ postId: id });
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate({ postId: id, content: commentText.trim() });
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-30 shadow-sm flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        <div className="max-w-lg mx-auto px-4 pt-6 animate-pulse space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="h-5 w-2/3 bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-3/4 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">게시글을 찾을 수 없습니다.</p>
        <button onClick={() => router.push('/community')} className="text-primary-500 font-medium">
          커뮤니티로 돌아가기
        </button>
      </div>
    );
  }

  const displayLikeCount = likeCount ?? post.like_count;

  return (
    <div className="min-h-screen bg-ivory pb-28">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-30 shadow-sm flex items-center gap-3">
        <button onClick={() => router.push('/community')} className="w-8 h-8 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1 truncate">커뮤니티</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Post card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          {/* Author row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-700">
              {post.user?.nickname?.[0] ?? '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{post.user?.nickname ?? '알 수 없음'}</p>
              <p className="text-xs text-gray-400">{formatRelativeTime(post.created_at)}</p>
            </div>
          </div>

          {post.title && (
            <h2 className="text-base font-bold text-gray-800 mb-2">{post.title}</h2>
          )}
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {/* Like button */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
              {displayLikeCount}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <MessageSquare className="w-4 h-4" />
              {comments.length}
            </span>
          </div>
        </div>

        {/* Comments section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-700">댓글 {comments.length}개</h3>
          </div>

          {commentsLoading ? (
            <div className="px-5 py-6 animate-pulse space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/4 bg-gray-200 rounded" />
                    <div className="h-3 w-full bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              첫 댓글을 남겨보세요 💬
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {comments.map((comment: {
                id: string;
                user_id: string;
                content: string;
                created_at: string;
                user?: { nickname: string; avatar_url?: string };
              }) => (
                <div key={comment.id} className="px-5 py-4 flex gap-3">
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700 flex-shrink-0">
                    {comment.user?.nickname?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-700">{comment.user?.nickname ?? '알 수 없음'}</span>
                      <span className="text-xs text-gray-400">{formatRelativeTime(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed comment input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value.slice(0, 500))}
            placeholder="댓글을 입력하세요..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
          />
          <button
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || addComment.isPending}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              commentText.trim() && !addComment.isPending
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
