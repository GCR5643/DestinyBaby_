'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getElementColor } from '@/lib/utils';
import type { SuggestedName } from '@/types';

interface VoteData {
  candidates: SuggestedName[];
  votes: Record<string, number>;
  hasVoted: boolean;
  votedFor: string | null;
}

function loadVoteData(shareId: string): VoteData | null {
  try {
    const raw = localStorage.getItem(`vote-${shareId}`);
    if (!raw) return null;
    const candidates: SuggestedName[] = JSON.parse(raw);
    const votesRaw = localStorage.getItem(`votes-${shareId}`);
    const votes: Record<string, number> = votesRaw ? JSON.parse(votesRaw) : {};
    const hasVoted = localStorage.getItem(`voted-${shareId}`) === 'true';
    const votedFor = localStorage.getItem(`votedFor-${shareId}`) ?? null;
    return { candidates, votes, hasVoted, votedFor };
  } catch {
    return null;
  }
}

export default function VotePage({ params }: { params: { shareId: string } }) {
  const { shareId } = params;

  const [data, setData] = useState<VoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const loaded = loadVoteData(shareId);
    setData(loaded);
    setLoading(false);
  }, [shareId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleVote = useCallback((name: string) => {
    if (!data || data.hasVoted) return;
    const newVotes = { ...data.votes, [name]: (data.votes[name] ?? 0) + 1 };
    localStorage.setItem(`votes-${shareId}`, JSON.stringify(newVotes));
    localStorage.setItem(`voted-${shareId}`, 'true');
    localStorage.setItem(`votedFor-${shareId}`, name);
    setData(prev => prev ? { ...prev, votes: newVotes, hasVoted: true, votedFor: name } : prev);
  }, [data, shareId]);

  const handleCopyLink = useCallback(() => {
    const link = `${window.location.origin}/naming/vote/${shareId}`;
    navigator.clipboard.writeText(link).then(() => {
      showToast('링크가 클립보드에 복사됐어요! 🎉');
    }).catch(() => {
      showToast(`링크: ${link}`);
    });
  }, [shareId]);

  const totalVotes = data ? Object.values(data.votes).reduce((a, b) => a + b, 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">😢</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">유효하지 않은 투표 링크입니다</h1>
          <p className="text-sm text-gray-500">링크가 만료됐거나 잘못된 주소예요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-secondary-400 to-primary-500 pt-12 pb-8 px-4 text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-3xl mb-2">👶</p>
          <h1 className="text-2xl font-bold mb-1">아기 이름 투표해주세요!</h1>
          <p className="text-sm opacity-80">소중한 한 표를 던져주세요 💕</p>
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Vote status */}
        {data.hasVoted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center"
          >
            <p className="text-green-700 font-medium text-sm">
              ✅ <strong>{data.votedFor}</strong>에 투표하셨어요! 총 {totalVotes}표 참여 중
            </p>
          </motion.div>
        )}

        {/* Candidate cards */}
        {data.candidates.map((candidate, i) => {
          const voteCount = data.votes[candidate.name] ?? 0;
          const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const elementColor = getElementColor(candidate.element ?? 'wood');
          const isVotedFor = data.votedFor === candidate.name;

          return (
            <motion.div
              key={candidate.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden"
              style={{ borderTop: `4px solid ${elementColor}` }}
            >
              <div className="p-5">
                {/* Name + hanja */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{candidate.name}</h2>
                    <p className="text-base text-gray-400 mt-0.5">{candidate.hanja}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: elementColor }}>
                      {voteCount}
                    </div>
                    <div className="text-xs text-gray-400">표</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{candidate.reasonShort}</p>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>득표율</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.08 + 0.3, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: elementColor }}
                    />
                  </div>
                </div>

                {/* Vote button */}
                <button
                  onClick={() => handleVote(candidate.name)}
                  disabled={data.hasVoted}
                  className={
                    data.hasVoted
                      ? isVotedFor
                        ? 'w-full py-3 rounded-xl text-sm font-medium bg-green-500 text-white cursor-default'
                        : 'w-full py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'w-full py-3 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors'
                  }
                >
                  {data.hasVoted
                    ? isVotedFor
                      ? '✅ 투표 완료'
                      : '투표 마감'
                    : '👍 투표하기'}
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Share link */}
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-secondary-400 text-secondary-500 font-medium hover:bg-secondary-50 transition-colors"
        >
          🔗 링크 공유하기
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-5 py-3 rounded-2xl shadow-lg z-50 whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
