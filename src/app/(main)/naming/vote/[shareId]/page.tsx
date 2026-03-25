'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getElementColor } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import type { SuggestedName } from '@/types';

export default function VotePage({ params }: { params: { shareId: string } }) {
  const { shareId } = params;

  const [voterName, setVoterName] = useState('');
  const [hasVoted, setHasVoted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`voted-${shareId}`) === 'true';
  });
  const [votedFor, setVotedFor] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`votedFor-${shareId}`) ?? null;
  });
  const [toast, setToast] = useState('');

  const sessionQuery = trpc.naming.getVoteSession.useQuery(
    { shareCode: shareId },
    { refetchOnWindowFocus: false }
  );

  const voteMutation = trpc.naming.vote.useMutation({
    onSuccess: () => {
      sessionQuery.refetch();
    },
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleVote = useCallback(async (name: string) => {
    if (hasVoted) return;
    try {
      await voteMutation.mutateAsync({
        shareCode: shareId,
        votedName: name,
        voterName: voterName || undefined,
      });
      localStorage.setItem(`voted-${shareId}`, 'true');
      localStorage.setItem(`votedFor-${shareId}`, name);
      setHasVoted(true);
      setVotedFor(name);
      showToast('투표 완료! 감사합니다 💕');
    } catch {
      showToast('투표에 실패했어요. 다시 시도해주세요.');
    }
  }, [hasVoted, shareId, voterName, voteMutation]);

  const handleCopyLink = useCallback(() => {
    const link = `${window.location.origin}/naming/vote/${shareId}`;
    navigator.clipboard.writeText(link).then(() => {
      showToast('링크가 클립보드에 복사됐어요! 🎉');
    }).catch(() => {
      showToast(`링크: ${link}`);
    });
  }, [shareId]);

  const handleKakaoShare = useCallback(() => {
    const voteUrl = `${window.location.origin}/naming/vote/${shareId}`;
    const cands = sessionQuery.data?.candidates ?? [];
    if (window.Kakao?.isInitialized?.()) {
      const nameList = cands.slice(0, 3).map((c: SuggestedName) => c.name).join(', ');
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '우리 아이 이름, 어떤 게 좋을까요? 🍼',
          description: `후보: ${nameList}${cands.length > 3 ? ' 외' : ''} — 투표해주세요!`,
          imageUrl: `${window.location.origin}/og-vote.png`,
          link: { mobileWebUrl: voteUrl, webUrl: voteUrl },
        },
        buttons: [
          { title: '투표하러 가기', link: { mobileWebUrl: voteUrl, webUrl: voteUrl } },
        ],
      });
    } else {
      navigator.clipboard.writeText(voteUrl).then(() => {
        showToast('카카오톡 연결이 안 돼요. 링크가 복사됐어요!');
      }).catch(() => {
        showToast(`링크: ${voteUrl}`);
      });
    }
  }, [shareId, sessionQuery.data]);

  // Loading
  if (sessionQuery.isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Not found / expired
  if (!sessionQuery.data) {
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

  const { candidates, voteCounts, voters, totalVotes } = sessionQuery.data;

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
        {/* Voter name input */}
        {!hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-4"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              투표자 이름 (선택)
            </label>
            <input
              type="text"
              value={voterName}
              onChange={e => setVoterName(e.target.value)}
              placeholder="예: 엄마, 할머니, 이모..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            />
          </motion.div>
        )}

        {/* Vote status */}
        {hasVoted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center"
          >
            <p className="text-green-700 font-medium text-sm">
              ✅ <strong>{votedFor}</strong>에 투표하셨어요! 총 {totalVotes}표 참여 중
            </p>
          </motion.div>
        )}

        {/* Candidate cards */}
        {candidates.map((candidate: SuggestedName, i: number) => {
          const voteCount = voteCounts[candidate.name] ?? 0;
          const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const elementColor = getElementColor(candidate.element ?? 'wood');
          const isVotedFor = votedFor === candidate.name;

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

                {/* Saju score */}
                {candidate.sajuScore && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-sm font-medium" style={{ color: elementColor }}>
                      사주 적합도 {candidate.sajuScore}점
                    </span>
                    <span className="text-yellow-400">⭐</span>
                  </div>
                )}

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
                  disabled={hasVoted || voteMutation.isPending}
                  className={
                    hasVoted
                      ? isVotedFor
                        ? 'w-full py-3 rounded-xl text-sm font-medium bg-green-500 text-white cursor-default'
                        : 'w-full py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'w-full py-3 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors'
                  }
                >
                  {hasVoted
                    ? isVotedFor
                      ? '✅ 투표 완료'
                      : '투표 마감'
                    : voteMutation.isPending
                      ? '투표 중...'
                      : '👍 투표하기'}
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Voter list (after voting) */}
        {hasVoted && voters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-5"
          >
            <h3 className="font-bold text-gray-800 mb-3">📋 투표 현황</h3>
            <div className="space-y-2">
              {voters.map((v, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">{v.name}</span>
                  <span className="font-medium text-primary-600">→ {v.votedFor}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleKakaoShare}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#FEE500] text-[#191919] font-medium hover:brightness-95 transition-all"
          >
            💬 카카오톡 공유
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-secondary-400 text-secondary-700 font-medium hover:bg-secondary-50 transition-colors"
          >
            🔗 링크 복사
          </button>
        </div>

        {/* Bottom CTA */}
        <a
          href="/naming"
          className="block w-full text-center py-3 rounded-2xl border-2 border-primary-300 text-primary-600 font-medium hover:bg-primary-50 transition-colors"
        >
          🍼 나도 이름 추천받기
        </a>
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
