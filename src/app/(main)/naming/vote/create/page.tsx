'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Share2, Link, MessageCircle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { useNamingStore } from '@/stores/namingStore';
import { useParentStore } from '@/stores/parentStore';
import type { SuggestedName } from '@/types';

interface Candidate {
  id: string;
  name: string;
  hanja: string;
  description: string;
  sajuScore?: number;
  element?: string;
  isCustom: boolean;
}

function toCandidate(s: SuggestedName, idx: number): Candidate {
  return {
    id: `ai-${idx}`,
    name: s.name,
    hanja: s.hanja,
    description: s.reasonShort,
    sajuScore: s.sajuScore,
    element: s.element,
    isCustom: false,
  };
}

export default function VoteCreatePage() {
  const router = useRouter();
  const { suggestedNames } = useNamingStore();
  const { dad, mom } = useParentStore();

  // 성씨 추론: 부모 이름 첫 글자 (아빠 우선)
  const inferredSurname = dad?.name?.charAt(0) ?? mom?.name?.charAt(0) ?? '';

  const [title, setTitle] = useState('우리 아이 이름 투표');
  const [surname, setSurname] = useState(inferredSurname);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // 커스텀 이름 추가 폼
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // 생성 완료 상태
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 스토어에서 추천 이름 초기화
  useEffect(() => {
    if (suggestedNames.length > 0) {
      setCandidates(suggestedNames.slice(0, 20).map(toCandidate));
    }
  }, [suggestedNames]);

  const createSession = trpc.voting.createSession.useMutation({
    onSuccess: (data) => {
      setShareCode(data.shareCode);
    },
  });

  const shareUrl = shareCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/naming/vote/${shareCode}`
    : '';

  function addCandidate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (candidates.length >= 20) return;
    const next: Candidate = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      hanja: '',
      description: newDesc.trim(),
      isCustom: true,
    };
    setCandidates((prev) => [...prev, next]);
    setNewName('');
    setNewDesc('');
    setShowAddForm(false);
  }

  function removeCandidate(id: string) {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }

  function handleCreate() {
    if (candidates.length === 0) return;
    createSession.mutate({
      title: title.trim() || '우리 아이 이름 투표',
      surname: surname.trim(),
      candidates: candidates.map((c) => ({
        name: c.name,
        hanja: c.hanja,
        description: c.description,
        sajuScore: c.sajuScore,
        element: c.element,
        isCustom: c.isCustom,
      })),
    });
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  function handleKakaoShare() {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Kakao = (window as unknown as { Kakao?: any }).Kakao;
    if (!Kakao?.Share) return;
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: title || '우리 아이 이름 투표',
        description: '소중한 이름을 골라주세요 💕',
        imageUrl: `${window.location.origin}/og-vote.png`,
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
      buttons: [
        { title: '투표하러 가기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } },
      ],
    });
  }

  // ===== 공유 완료 화면 =====
  if (shareCode) {
    return (
      <div className="min-h-screen bg-ivory pb-24">
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 pt-12 pb-6 px-4">
          <div className="max-w-lg mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-5xl mb-3"
            >
              🎉
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">투표 링크가 만들어졌어요!</h1>
            <p className="text-sm text-gray-500">가족과 지인에게 공유해 보세요</p>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 mt-6 space-y-4">
          {/* URL 박스 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-5"
          >
            <p className="text-xs text-gray-400 mb-2 font-medium">투표 링크</p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
              <span className="flex-1 text-sm text-gray-700 truncate">{shareUrl}</span>
              <button
                onClick={handleCopy}
                className="shrink-0 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg"
              >
                {copied ? '복사됨 ✓' : '복사'}
              </button>
            </div>
          </motion.div>

          {/* 공유 버튼들 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
          >
            <p className="text-sm font-bold text-gray-700 mb-1">공유하기</p>

            {/* 카카오 공유 */}
            <button
              onClick={handleKakaoShare}
              className="w-full flex items-center gap-3 bg-[#FEE500] hover:bg-[#F6DB00] text-[#3C1E1E] py-3.5 px-4 rounded-xl font-bold text-sm transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              카카오톡으로 공유하기
            </button>

            {/* 링크 복사 */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 px-4 rounded-xl font-bold text-sm transition-colors"
            >
              <Link className="w-5 h-5" />
              {copied ? '링크가 복사됐어요 ✓' : '링크 복사하기'}
            </button>
          </motion.div>

          {/* 결과 보기 링크 */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            onClick={() => router.push(`/naming/vote/results/${shareCode}`)}
            className="w-full flex items-center justify-between bg-white rounded-2xl shadow-sm p-5 text-left"
          >
            <div>
              <p className="font-bold text-gray-800 text-sm">투표 결과 보기</p>
              <p className="text-xs text-gray-400 mt-0.5">현재까지의 투표 현황을 확인해요</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
      </div>
    );
  }

  // ===== 투표 만들기 화면 =====
  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 pt-12 pb-6 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-6 h-6 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900">투표 만들기</h1>
          </div>
          <p className="text-sm text-gray-500">가족과 함께 아이 이름을 골라보세요</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-4">
        {/* 제목 + 성씨 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">투표 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="우리 아이 이름 투표"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">성씨 (선택)</label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="예: 김"
              maxLength={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none"
            />
          </div>
        </motion.div>

        {/* 후보 목록 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-bold text-gray-700">
              후보 이름 <span className="text-primary-500">{candidates.length}</span>
              <span className="text-gray-400">/20</span>
            </p>
          </div>

          <AnimatePresence>
            {candidates.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-sm p-4 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-gray-900">
                      {surname ? `${surname}${c.name}` : c.name}
                    </span>
                    {c.hanja && (
                      <span className="text-xs text-gray-400">{c.hanja}</span>
                    )}
                    {c.isCustom ? (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                        직접 추가
                      </span>
                    ) : (
                      c.sajuScore !== undefined && (
                        <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">
                          사주 {c.sajuScore}점
                        </span>
                      )
                    )}
                  </div>
                  {c.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{c.description}</p>
                  )}
                </div>
                <button
                  onClick={() => removeCandidate(c.id)}
                  className="shrink-0 p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {candidates.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">
              <p className="text-sm">후보 이름이 없어요</p>
              <p className="text-xs mt-1">아래에서 이름을 추가해 보세요</p>
            </div>
          )}
        </motion.div>

        {/* 직접 추가 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <button
            onClick={() => setShowAddForm((v) => !v)}
            disabled={candidates.length >= 20}
            className="w-full flex items-center gap-3 px-5 py-4 text-left disabled:opacity-40"
          >
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4 text-primary-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700">이름 직접 추가</p>
              {candidates.length >= 20 && (
                <p className="text-xs text-gray-400">최대 20개까지 추가할 수 있어요</p>
              )}
            </div>
          </button>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-3 border-t border-gray-50">
                  <div className="pt-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">이름 (한글)</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="예: 서윤"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">설명 (선택)</label>
                    <input
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="예: 서쪽 하늘의 별처럼 빛나다"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none"
                    />
                  </div>
                  <button
                    onClick={addCandidate}
                    disabled={!newName.trim()}
                    className="w-full bg-primary-500 disabled:bg-gray-200 text-white disabled:text-gray-400 py-2.5 rounded-xl font-bold text-sm transition-colors"
                  >
                    추가
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 생성 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <button
            onClick={handleCreate}
            disabled={candidates.length === 0 || createSession.isPending}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 disabled:from-gray-200 disabled:to-gray-200 text-white disabled:text-gray-400 py-4 rounded-2xl font-bold text-base shadow-lg disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {createSession.isPending ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                링크 만드는 중...
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                투표 링크 만들기
              </>
            )}
          </button>
          {createSession.isError && (
            <p className="text-xs text-red-500 text-center mt-2">
              오류가 발생했어요. 다시 시도해 주세요.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
