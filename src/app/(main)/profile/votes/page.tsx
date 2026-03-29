'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Share2, Users, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { trpc } from '@/lib/trpc/client';
import { SKIP_AUTH } from '@/lib/auth/skip-auth';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function isActive(expiresAt: string | null) {
  if (!expiresAt) return true;
  return new Date(expiresAt) > new Date();
}

export default function ProfileVotesPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { data: sessions, isLoading } = trpc.voting.getMySessions.useQuery(undefined, { enabled: !!user || SKIP_AUTH });

  if (!user && !SKIP_AUTH) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-2">로그인이 필요해요</h1>
          <p className="text-gray-500 text-sm mb-8">로그인하고 투표 관리 기능을 이용해보세요</p>
          <Link
            href="/login?redirect=/profile/votes"
            className="block w-full bg-primary-500 text-white text-center py-4 rounded-2xl font-bold text-base shadow-lg"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800 flex-1">내 투표 관리 📊</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5">
        {/* CTA Button */}
        <Link
          href="/naming/vote/create"
          className="flex items-center justify-center gap-2 w-full bg-primary-500 text-white py-3.5 rounded-2xl font-bold text-base shadow-md mb-6"
        >
          <Plus className="w-5 h-5" />
          새 투표 만들기
        </Link>

        {/* Sessions list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-base font-bold text-gray-700 mb-2">아직 만든 투표가 없어요</h2>
            <p className="text-sm text-gray-400 mb-6">가족·친구들과 아이 이름을 함께 골라보세요!</p>
            <Link
              href="/naming/vote/create"
              className="bg-primary-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow"
            >
              첫 투표 만들기
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="space-y-3"
          >
            {sessions.map(session => {
              const active = isActive(session.expiresAt);
              const previewNames = session.candidateNames.slice(0, 3);

              return (
                <motion.div
                  key={session.id}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <Link
                    href={`/naming/vote/results/${session.shareCode}`}
                    className="flex items-start gap-3 p-4"
                  >
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-800 text-base truncate">{session.title}</h3>
                        <span
                          className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${
                            active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {active ? '진행중' : '종료'}
                        </span>
                      </div>

                      {/* Candidate chips */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {previewNames.map(name => (
                          <span
                            key={name}
                            className="bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full font-medium"
                          >
                            {name}
                          </span>
                        ))}
                        {session.candidateCount > 3 && (
                          <span className="bg-gray-100 text-gray-400 text-xs px-2.5 py-1 rounded-full font-medium">
                            +{session.candidateCount - 3}
                          </span>
                        )}
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          투표 {session.totalVoters}명
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(session.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-2 shrink-0 self-center">
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </Link>

                  {/* Share button strip */}
                  <div className="border-t border-gray-50 px-4 py-2.5 flex justify-end">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        const url = `${window.location.origin}/naming/vote/${session.shareCode}`;
                        if (navigator.share) {
                          await navigator.share({ title: session.title, url });
                        } else {
                          await navigator.clipboard.writeText(url);
                          alert('링크가 복사되었어요!');
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold bg-primary-50 px-3 py-1.5 rounded-full"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      공유하기
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
