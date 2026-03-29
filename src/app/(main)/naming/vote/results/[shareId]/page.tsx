'use client';

import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_BORDER: Record<number, string> = {
  0: 'border-yellow-400',
  1: 'border-gray-300',
  2: 'border-amber-600',
};
const RANK_BG: Record<number, string> = {
  0: 'bg-yellow-50',
  1: 'bg-gray-50',
  2: 'bg-amber-50',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function VoteResultsPage() {
  const params = useParams();
  const shareCode = params.shareId as string;

  const { data, isLoading } = trpc.voting.getResults.useQuery(
    { shareCode },
    { refetchOnWindowFocus: false }
  );

  const handleCopyLink = () => {
    const url = `${window.location.origin}/naming/vote/${shareCode}`;
    navigator.clipboard.writeText(url).catch(() => {});
  };

  const handleKakaoShare = () => {
    const voteUrl = `${window.location.origin}/naming/vote/${shareCode}`;
    const resultsUrl = window.location.href;
    if (window.Kakao?.isInitialized?.()) {
      const winner = data?.ranking[0];
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: data?.title ?? '아기 이름 투표 결과',
          description: winner
            ? `1위: ${data?.surname ?? ''}${winner.name} (${winner.votes}표)`
            : '투표 결과를 확인해보세요!',
          imageUrl: `${window.location.origin}/og-vote.png`,
          link: { mobileWebUrl: resultsUrl, webUrl: resultsUrl },
        },
        buttons: [
          { title: '결과 보기', link: { mobileWebUrl: resultsUrl, webUrl: resultsUrl } },
          { title: '투표하기', link: { mobileWebUrl: voteUrl, webUrl: voteUrl } },
        ],
      });
    } else {
      navigator.clipboard.writeText(resultsUrl).catch(() => {});
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">결과 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">😢</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">결과를 찾을 수 없어요</h1>
          <p className="text-sm text-gray-500 mb-6">링크가 만료됐거나 잘못된 주소예요.</p>
          <Link href="/" className="text-primary-600 font-medium underline">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  const { title, surname, ranking, blessings, totalVoters, totalVotes } = data;
  const winner = ranking[0];

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-400 to-amber-500 pt-12 pb-8 px-4 text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-4xl mb-2">🏆</p>
          <h1 className="text-2xl font-bold mb-1">투표 결과</h1>
          {title && (
            <p className="text-sm opacity-90 mb-1">{title}</p>
          )}
          <p className="text-sm opacity-80">
            총 {totalVoters}명 참여 · {totalVotes}표
          </p>
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Winner card (rank 0) */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl shadow-lg border-2 p-6 ${RANK_BORDER[0]} ${RANK_BG[0]}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{MEDAL[0]}</span>
                  <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                    1위
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">
                  {surname}{winner.name}
                </h2>
                {winner.hanja && (
                  <p className="text-base text-gray-400 mt-0.5">{winner.hanja}</p>
                )}
                {winner.description && (
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{winner.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-600">{winner.votes}</div>
                <div className="text-xs text-gray-400">표</div>
                <div className="text-sm font-semibold text-yellow-700 mt-0.5">
                  {totalVotes > 0 ? Math.round((winner.votes / totalVotes) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="h-3 bg-yellow-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${totalVotes > 0 ? Math.round((winner.votes / totalVotes) * 100) : 0}%`,
                  }}
                  transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                />
              </div>
            </div>

            {/* Voter chips */}
            {winner.voters.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {winner.voters.map((v, i) => (
                  <span
                    key={i}
                    className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium"
                  >
                    {v}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Rank 2 & 3 */}
        {ranking.slice(1, 3).map((item, idx) => {
          const rank = idx + 1; // 1 = 2nd place, 2 = 3rd place
          const pct = totalVotes > 0 ? Math.round((item.votes / totalVotes) * 100) : 0;
          const barColors = ['bg-gray-400', 'bg-amber-600'];

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + rank * 0.08 }}
              className={`rounded-2xl shadow-md border-2 p-5 ${RANK_BORDER[rank]} ${RANK_BG[rank]}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{MEDAL[rank]}</span>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {rank + 1}위
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {surname}{item.name}
                  </h3>
                  {item.hanja && (
                    <p className="text-sm text-gray-400 mt-0.5">{item.hanja}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-700">{item.votes}</div>
                  <div className="text-xs text-gray-400">표</div>
                  <div className="text-sm font-semibold text-gray-500 mt-0.5">{pct}%</div>
                </div>
              </div>

              <div className="mb-2">
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3 + rank * 0.08, duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${barColors[idx]}`}
                  />
                </div>
              </div>

              {item.voters.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.voters.map((v, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Remaining rankings (4th+) */}
        {ranking.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-md p-4 space-y-3"
          >
            {ranking.slice(3).map((item, idx) => {
              const rank = idx + 4;
              const pct = totalVotes > 0 ? Math.round((item.votes / totalVotes) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-6 text-center shrink-0">
                    {rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-gray-800">
                        {surname}{item.name}
                      </span>
                      {item.hanja && (
                        <span className="text-xs text-gray-400">{item.hanja}</span>
                      )}
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + idx * 0.05, duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-primary-300"
                      />
                    </div>
                    {item.voters.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.voters.map((v, i) => (
                          <span key={i} className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-full border border-gray-100">
                            {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-gray-600">{item.votes}표</div>
                    <div className="text-xs text-gray-400">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* 덕담 section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-md p-5"
        >
          <h3 className="font-bold text-gray-800 text-lg mb-4">소중한 축하 한마디 💝</h3>
          <AnimatePresence>
            {blessings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-2">💌</p>
                <p className="text-sm text-gray-400">아직 남긴 메시지가 없어요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blessings.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + i * 0.06 }}
                    className="bg-pink-50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-pink-700">{b.name}</span>
                      <span className="text-xs text-gray-400">{formatDate(b.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{b.message}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          {/* Share buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleKakaoShare}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#FEE500] text-[#191919] font-medium hover:brightness-95 transition-all text-sm"
            >
              💬 카카오로 공유
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-secondary-400 text-secondary-700 font-medium hover:bg-secondary-50 transition-colors text-sm"
            >
              🔗 링크 복사
            </button>
          </div>

          <Link
            href="/naming/vote/create"
            className="block w-full text-center py-3.5 rounded-2xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors text-sm"
          >
            ✨ 새 투표 만들기
          </Link>

          <Link
            href={`/naming/vote/${shareCode}`}
            className="block w-full text-center py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            ← 투표에 참여하러 가기
          </Link>

          <Link
            href="/"
            className="block w-full text-center py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            홈으로
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
