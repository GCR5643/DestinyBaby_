'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc/client';

interface Candidate {
  name: string;
  hanja?: string;
  description?: string;
  sajuScore?: number;
  element?: string;
  isCustom?: boolean;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-5 h-5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function VotePage({ params }: { params: { shareId: string } }) {
  const { shareId } = params;

  // Multi-selection state
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  // Voter info state
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [voterName, setVoterName] = useState('');
  const [blessingMessage, setBlessingMessage] = useState('');

  // UI state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Already-voted state (from localStorage)
  const [alreadyVoted, setAlreadyVoted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`vote_${shareId}`);
      if (stored === 'true') {
        setAlreadyVoted(true);
      }
    }
  }, [shareId]);

  const sessionQuery = trpc.voting.getSession.useQuery(
    { shareCode: shareId },
    { refetchOnWindowFocus: false }
  );

  const submitVoteMutation = trpc.voting.submitVote.useMutation({
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`vote_${shareId}`, 'true');
      }
      setAlreadyVoted(true);
      setShowSuccessPopup(true);
      sessionQuery.refetch();
    },
    onError: (err) => {
      setErrorMsg(err.message || '투표에 실패했어요. 다시 시도해주세요.');
      setTimeout(() => setErrorMsg(''), 3000);
    },
  });

  const toggleName = useCallback((name: string) => {
    setSelectedNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selectedNames.length === 0) return;
    await submitVoteMutation.mutateAsync({
      shareCode: shareId,
      selectedNames,
      voterName: isAnonymous ? undefined : (voterName.trim() || undefined),
      isAnonymous,
      blessingMessage: blessingMessage.trim() || undefined,
    });
  }, [shareId, selectedNames, voterName, isAnonymous, blessingMessage, submitVoteMutation]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (sessionQuery.isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────────
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

  const { candidates, voteCounts, totalVotes, surname } = sessionQuery.data;

  // ── Already voted view ───────────────────────────────────────────────────────
  if (alreadyVoted && !showSuccessPopup) {
    return (
      <div className="min-h-screen bg-ivory pb-16">
        {/* Header */}
        <div className="bg-gradient-to-br from-pink-400 to-primary-500 pt-12 pb-10 px-4 text-white text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-3xl mb-2">🍼</p>
            <h1 className="text-2xl font-bold mb-1">우리 아이 이름 투표</h1>
            <p className="text-sm opacity-80">총 {totalVotes}명 참여 중</p>
          </motion.div>
        </div>

        <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
          {/* Already voted banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center"
          >
            <p className="text-2xl mb-1">✅</p>
            <p className="text-green-700 font-semibold text-base">이미 투표했어요!</p>
            <p className="text-green-600 text-sm mt-1">소중한 한 표 감사해요 💕</p>
          </motion.div>

          {/* Results preview */}
          <div className="space-y-3">
            {candidates.map((candidate: Candidate, i: number) => {
              const voteCount = voteCounts[candidate.name] ?? 0;
              const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const fullName = surname ? `${surname}${candidate.name}` : candidate.name;

              return (
                <motion.div
                  key={candidate.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{fullName}</h2>
                      {candidate.hanja && (
                        <p className="text-sm text-gray-400 mt-0.5">{candidate.hanja}</p>
                      )}
                    </div>
                    <span className="bg-primary-50 text-primary-600 text-sm font-bold px-3 py-1 rounded-full">
                      {voteCount}표
                    </span>
                  </div>
                  {candidate.description && (
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed">{candidate.description}</p>
                  )}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.07 + 0.3, duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-pink-400 to-primary-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">{pct}%</p>
                </motion.div>
              );
            })}
          </div>

          {/* CTAs */}
          <a
            href={`/naming/vote/results/${shareId}`}
            className="block w-full text-center py-3.5 rounded-2xl bg-gradient-to-r from-pink-400 to-primary-500 text-white font-semibold shadow-md hover:opacity-90 transition-opacity"
          >
            투표 결과 보기 →
          </a>
          <a
            href="/daily-fortune"
            className="block w-full text-center py-3.5 rounded-2xl border-2 border-primary-300 text-primary-600 font-medium hover:bg-primary-50 transition-colors"
          >
            오늘의 운세 보러 가기 🌟
          </a>
        </div>
      </div>
    );
  }

  // ── Main voting view ─────────────────────────────────────────────────────────
  const canSubmit = selectedNames.length > 0 && !submitVoteMutation.isPending;

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-400 to-primary-500 pt-12 pb-10 px-4 text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-3xl mb-2">🍼</p>
          <h1 className="text-2xl font-bold mb-1">우리 아이 이름 투표</h1>
          <p className="text-sm opacity-80">총 {totalVotes}명 참여했어요</p>
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">

        {/* Instruction */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center text-sm text-gray-500 pt-2"
        >
          마음에 드는 이름을 모두 선택해주세요 ✨
        </motion.p>

        {/* Candidate cards */}
        {candidates.map((candidate: Candidate, i: number) => {
          const isSelected = selectedNames.includes(candidate.name);
          const voteCount = voteCounts[candidate.name] ?? 0;
          const fullName = surname ? `${surname}${candidate.name}` : candidate.name;

          return (
            <motion.button
              key={candidate.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => toggleName(candidate.name)}
              className={`w-full text-left bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-200 relative ${
                isSelected
                  ? 'border-2 border-primary-500 shadow-primary-100 shadow-md'
                  : 'border-2 border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Vote count badge */}
              <span className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">
                {voteCount}표
              </span>

              {/* Selected checkmark */}
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 bg-primary-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                >
                  <CheckIcon />
                </motion.span>
              )}

              <div className="p-5 pr-16">
                {/* Name row */}
                <h2 className={`text-3xl font-bold mb-0.5 ${isSelected ? 'text-primary-600' : 'text-gray-800'}`}>
                  {fullName}
                </h2>
                {candidate.hanja && (
                  <p className="text-sm text-gray-400 mb-2">{candidate.hanja}</p>
                )}
                {candidate.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{candidate.description}</p>
                )}
                {candidate.sajuScore !== undefined && (
                  <p className="text-xs text-primary-500 mt-2 font-medium">사주 적합도 {candidate.sajuScore}점 ⭐</p>
                )}
              </div>

              {/* Selected bottom bar */}
              {isSelected && (
                <div className="h-1 bg-gradient-to-r from-pink-400 to-primary-500" />
              )}
            </motion.button>
          );
        })}

        {/* Voter info section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: candidates.length * 0.08 + 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4"
        >
          <h3 className="font-semibold text-gray-800 text-base">투표자 정보</h3>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">익명으로 투표</span>
            <button
              onClick={() => setIsAnonymous(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                isAnonymous ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  isAnonymous ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Name input */}
          <AnimatePresence>
            {!isAnonymous && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  이름 입력 <span className="text-gray-400 font-normal">(선택)</span>
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
          </AnimatePresence>

          {/* Blessing message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              덕담 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <textarea
              value={blessingMessage}
              onChange={e => setBlessingMessage(e.target.value)}
              placeholder="축하 한마디를 남겨주세요 💝"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent resize-none"
            />
          </div>
        </motion.div>

        {/* Submit button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: candidates.length * 0.08 + 0.2 }}
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 ${
            canSubmit
              ? 'bg-gradient-to-r from-pink-400 to-primary-500 text-white shadow-lg hover:opacity-90 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {submitVoteMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              투표 중...
            </span>
          ) : selectedNames.length === 0 ? (
            '이름을 선택해주세요'
          ) : (
            `투표하기 ✨ (${selectedNames.length}개 선택됨)`
          )}
        </motion.button>

        {/* Error message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm text-red-500"
            >
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <a
          href="/naming"
          className="block w-full text-center py-3 rounded-2xl border-2 border-primary-200 text-primary-500 text-sm font-medium hover:bg-primary-50 transition-colors"
        >
          🍼 나도 아기 이름 추천받기
        </a>
      </div>

      {/* Success popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowSuccessPopup(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed inset-x-4 bottom-8 z-50 max-w-sm mx-auto bg-white rounded-3xl shadow-2xl p-7 text-center"
            >
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-5xl mb-3"
              >
                🎉
              </motion.p>
              <h2 className="text-xl font-bold text-gray-800 mb-1">투표 완료!</h2>
              <p className="text-sm text-gray-500 mb-6">소중한 한 표 감사해요 💕</p>

              <div className="space-y-3">
                <a
                  href={`/naming/vote/results/${shareId}`}
                  className="block w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-400 to-primary-500 text-white font-semibold text-sm shadow hover:opacity-90 transition-opacity"
                >
                  투표 결과 보기 →
                </a>
                <a
                  href="/daily-fortune"
                  className="block w-full py-3.5 rounded-2xl border-2 border-primary-200 text-primary-600 font-medium text-sm hover:bg-primary-50 transition-colors"
                >
                  오늘의 운세도 한번 보시겠어요? 🌟
                </a>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
