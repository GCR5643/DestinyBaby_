'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Star, X, Shuffle, RefreshCw, BookmarkCheck, Bookmark, Plus, MessageCircle } from 'lucide-react';
import type { SuggestedName } from '@/types';
import { DemoBanner } from '@/components/naming/DemoBanner';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { createClient } from '@/lib/supabase/client';
import { SKIP_AUTH } from '@/lib/auth/skip-auth';
import { OhengTheme, CozyPanel, RibbonBanner } from '@/components/cozy';

// ── Mock data pool ────────────────────────────────────────────────────────────

const ONE_CHAR: SuggestedName[] = [
  { name: '온', hanja: '溫', reasonShort: '따뜻한 기운이 온몸을 감싸는 이름', sajuScore: 91, element: 'fire' },
  { name: '율', hanja: '律', reasonShort: '삶의 리듬을 스스로 조율하는 기운', sajuScore: 88, element: 'metal' },
  { name: '빛', hanja: '光', reasonShort: '세상을 밝히는 빛처럼 환한 이름', sajuScore: 90, element: 'fire' },
  { name: '결', hanja: '潔', reasonShort: '맑고 깨끗한 성품을 담은 이름', sajuScore: 85, element: 'water' },
  { name: '찬', hanja: '燦', reasonShort: '찬란하게 빛나는 미래를 담은 이름', sajuScore: 87, element: 'fire' },
  { name: '솔', hanja: '率', reasonShort: '솔직하고 씩씩하게 이끄는 기운', sajuScore: 83, element: 'wood' },
  { name: '도', hanja: '道', reasonShort: '올바른 길을 걷는 기운이 담긴 이름', sajuScore: 84, element: 'earth' },
  { name: '현', hanja: '賢', reasonShort: '현명하고 지혜로운 기운의 이름', sajuScore: 89, element: 'metal' },
  { name: '란', hanja: '蘭', reasonShort: '난초처럼 고귀하고 향기로운 이름', sajuScore: 82, element: 'wood' },
  { name: '희', hanja: '熙', reasonShort: '기쁨과 밝음이 넘쳐흐르는 이름', sajuScore: 86, element: 'fire' },
];

const TWO_CHAR: SuggestedName[] = [
  { name: '지우', hanja: '智宇', reasonShort: '지혜롭고 드넓은 기운을 가진 이름', sajuScore: 92, element: 'water' },
  { name: '서연', hanja: '瑞然', reasonShort: '상서로운 기운이 자연스럽게 흐르는 이름', sajuScore: 88, element: 'wood' },
  { name: '하준', hanja: '夏俊', reasonShort: '여름처럼 밝고 준수한 기운', sajuScore: 85, element: 'fire' },
  { name: '유나', hanja: '裕娜', reasonShort: '풍요롭고 우아한 기운을 담은 이름', sajuScore: 83, element: 'earth' },
  { name: '민준', hanja: '敏俊', reasonShort: '영특하고 준수한 기운이 깃든 이름', sajuScore: 80, element: 'metal' },
  { name: '서준', hanja: '序俊', reasonShort: '차분하면서도 준수한 기운의 이름', sajuScore: 87, element: 'wood' },
  { name: '아린', hanja: '雅璘', reasonShort: '우아하고 영롱한 빛을 품은 이름', sajuScore: 90, element: 'metal' },
  { name: '채원', hanja: '彩源', reasonShort: '다채로운 빛의 근원이 되는 이름', sajuScore: 86, element: 'fire' },
  { name: '도윤', hanja: '道允', reasonShort: '바른 길을 허락받은 기운의 이름', sajuScore: 84, element: 'earth' },
  { name: '시우', hanja: '時雨', reasonShort: '때맞은 비처럼 단비 같은 존재', sajuScore: 82, element: 'water' },
  { name: '예린', hanja: '叡燐', reasonShort: '총명하고 영롱한 빛을 발하는 이름', sajuScore: 91, element: 'fire' },
  { name: '지호', hanja: '智昊', reasonShort: '지혜롭고 하늘처럼 넓은 기운', sajuScore: 89, element: 'water' },
  { name: '수아', hanja: '秀雅', reasonShort: '빼어나고 우아한 기운의 이름', sajuScore: 93, element: 'wood' },
  { name: '태양', hanja: '泰陽', reasonShort: '크고 밝은 태양처럼 빛나는 이름', sajuScore: 88, element: 'fire' },
  { name: '나은', hanja: '娜恩', reasonShort: '우아하고 은혜로운 기운의 이름', sajuScore: 85, element: 'earth' },
  { name: '은서', hanja: '恩緖', reasonShort: '은혜로운 실마리를 잇는 이름', sajuScore: 83, element: 'metal' },
  { name: '규민', hanja: '奎敏', reasonShort: '별처럼 총명하고 영특한 기운', sajuScore: 87, element: 'metal' },
  { name: '하은', hanja: '夏恩', reasonShort: '여름 햇살 같은 은혜로운 이름', sajuScore: 84, element: 'fire' },
  { name: '지안', hanja: '智安', reasonShort: '지혜롭고 평안한 기운의 이름', sajuScore: 90, element: 'water' },
  { name: '민서', hanja: '敏瑞', reasonShort: '총명하고 상서로운 기운의 이름', sajuScore: 86, element: 'wood' },
];

const ALL_NAMES: Record<'1' | '2', SuggestedName[]> = {
  '1': ONE_CHAR,
  '2': TWO_CHAR,
};

type LengthFilter = '1' | '2';

// ── Popularity types & helpers ─────────────────────────────────────────────

interface PopularityInfo {
  recentCount: number;
  trend: 'rising' | 'stable' | 'falling' | 'new';
  trendPercent: number;
}

function TrendBadge({ info }: { info: PopularityInfo | undefined }) {
  if (!info) return null;
  const { recentCount, trend, trendPercent } = info;
  const config = {
    rising:  { icon: '🔥', label: '인기 상승', bg: 'bg-rose-50',   text: 'text-rose-600',   border: 'border-rose-200' },
    stable:  { icon: '→',  label: '안정적',   bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200' },
    falling: { icon: '↓',  label: '감소중',   bg: 'bg-blue-50',   text: 'text-blue-400',   border: 'border-blue-200' },
    new:     { icon: '✨', label: '신규',     bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  }[trend];
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${config.bg} ${config.text} ${config.border}`}>
      <span>{config.icon}</span>
      <span>이번 달 {recentCount.toLocaleString()}명</span>
      {trend !== 'stable' && trend !== 'new' && (
        <span className="opacity-70">({trendPercent > 0 ? '+' : ''}{trendPercent}%)</span>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const ELEMENT_KO: Record<string, string> = { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' };

interface NameCardProps {
  name: SuggestedName;
  index: number;
  isCandidate: boolean;
  popularity: PopularityInfo | undefined;
  surname: string;
  surnameHanja?: string;
  lackingElement?: string;
  onAddCandidate: (name: SuggestedName) => void;
  onVoice: (name: string) => void;
}

function NameCard({ name, index, isCandidate, popularity, surname, surnameHanja, lackingElement, onAddCandidate, onVoice }: NameCardProps) {
  const fullName = surname ? `${surname}${name.name}` : name.name;
  const fullHanja = surnameHanja ? `${surnameHanja}${name.hanja}` : name.hanja;

  // 사주 점수 → 수집 등급 느낌으로 컬러링
  const scoreColor =
    name.sajuScore >= 90 ? 'text-amber-500' :
    name.sajuScore >= 80 ? 'text-primary-600' :
    'text-gray-500';

  return (
    <motion.div
      key={name.name}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.07 }}
    >
      <CozyPanel
        element={name.element}
        tone="pastel"
        padding="none"
        hover
        className="overflow-hidden"
      >
        {/* 카드 상단 — 이름 + 점수 */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="font-display text-3xl text-gray-800 leading-tight">{fullName}</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {surnameHanja
                ? fullHanja
                : <>{surname && <span className="text-gray-300">{surname} </span>}{name.hanja}</>
              }
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <div className={cn('font-display text-2xl font-bold leading-none', scoreColor)}>
              {name.sajuScore}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">사주 점수</div>
            <div className="mt-1.5">
              <TrendBadge info={popularity} />
            </div>
          </div>
        </div>

        {/* 뜻풀이 영역 */}
        <div className="px-5 pb-3 space-y-2">
          <div className="bg-white/70 rounded-xl p-3 border border-white/80">
            <p className="text-[11px] font-semibold text-amber-600 mb-1">📖 뜻풀이</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {name.meaning ?? `${fullName}은(는) ${name.reasonShort}`}
            </p>
          </div>
          {name.sajuInsight && (
            <div className="bg-white/70 rounded-xl p-3 border border-white/80">
              <p className="text-[11px] font-semibold text-primary-600 mb-1">✦ 성명학</p>
              <p className="text-sm text-primary-800 leading-relaxed">{name.sajuInsight}</p>
            </div>
          )}
        </div>

        {/* 오행 태그 */}
        {(name.element || lackingElement) && (
          <div className="flex flex-wrap gap-1.5 px-5 pb-3">
            {name.element && (
              <span className="inline-flex items-center gap-1 text-xs bg-white/80 text-gray-600 px-2.5 py-1 rounded-full font-medium border border-white/90">
                ✦ {ELEMENT_KO[name.element]} 기운
              </span>
            )}
            {lackingElement && name.element && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-100">
                부족한 {ELEMENT_KO[lackingElement]} 보완
              </span>
            )}
          </div>
        )}

        {/* 한자 풀이 리본 배너 */}
        {name.hanja && (
          <div className="flex justify-center pb-4">
            <RibbonBanner element={name.element} size="sm">
              {name.hanja} — {name.reasonShort.slice(0, 16)}{name.reasonShort.length > 16 ? '…' : ''}
            </RibbonBanner>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={() => onVoice(name.name)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/60 border border-white/80 text-sm text-gray-600 hover:bg-white/90 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            발음 듣기
          </button>
          <button
            onClick={() => !isCandidate && onAddCandidate(name)}
            disabled={isCandidate}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
              isCandidate
                ? 'bg-green-50 text-green-600 border border-green-100 cursor-default'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            )}
          >
            <Star className="w-4 h-4" />
            {isCandidate ? '✅ 후보됨' : '⭐ 후보 추가'}
          </button>
        </div>
      </CozyPanel>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function NamingResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isGuest = params.id === 'guest';

  const [filter, setFilter] = useState<LengthFilter>('2');
  const [pool, setPool] = useState<SuggestedName[]>([]);
  const [offset, setOffset] = useState(0);
  const [displayed, setDisplayed] = useState<SuggestedName[]>([]);
  const [candidates, setCandidates] = useState<SuggestedName[]>([]);
  const [toast, setToast] = useState('');
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [finalName, setFinalName] = useState<SuggestedName | null>(null);
  const [popularityMap, setPopularityMap] = useState<Record<string, PopularityInfo>>({});
  const [realNames, setRealNames] = useState<SuggestedName[] | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showRegeneratePrompt, setShowRegeneratePrompt] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenCount, setRegenCount] = useState(0);
  const [famousNameQuery, setFamousNameQuery] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [surname, setSurname] = useState('');
  const [surnameHanja, setSurnameHanja] = useState('');
  const [lackingElement, setLackingElement] = useState<string | undefined>();

  // sessionStorage에서 성씨 및 사주 정보 복원
  useEffect(() => {
    try {
      const payload = sessionStorage.getItem('guest-naming-payload');
      if (payload) {
        const parsed = JSON.parse(payload);
        if (parsed.surname) setSurname(parsed.surname);
        if (parsed.surnameHanja) setSurnameHanja(parsed.surnameHanja);
        // 부족 오행은 서버에서 계산하지만, 클라이언트에선 SuggestedName의 element로 추정
      }
    } catch (error) { console.error('[NamingResult] 처리 실패:', error); }
  }, []);

  // 재생성 횟수 제한: 비로그인 3회, 로그인 5회
  const MAX_REGEN = isLoggedIn ? 5 : 3;
  const canRegenerate = regenCount < MAX_REGEN;

  const generateNamesPublic = trpc.naming.generateNamesPublic.useMutation();

  // 유명인 검색 쿼리
  const famousNamesQuery = trpc.naming.getFamousNames.useQuery(
    { givenName: famousNameQuery ?? '' },
    { enabled: !!famousNameQuery, staleTime: 1000 * 60 * 30 }
  );

  const handleRegenerate = useCallback(async () => {
    if (isRegenerating) return;
    if (!canRegenerate) {
      showToast(`이름 추천은 최대 ${MAX_REGEN}회까지 가능해요.${!isLoggedIn ? ' 로그인하면 더 많이 받을 수 있어요!' : ''}`);
      return;
    }
    setIsRegenerating(true);
    try {
      const storedPayload = sessionStorage.getItem('guest-naming-payload');
      if (!storedPayload) {
        router.push('/naming');
        return;
      }
      const payload = JSON.parse(storedPayload);
      const result = await generateNamesPublic.mutateAsync(payload);
      sessionStorage.setItem('guest-naming-result', JSON.stringify(result.names));
      setRealNames(result.names);
      setRegenCount(prev => prev + 1);
      setShowRegeneratePrompt(false);
      setOffset(0);
      showToast(`새로운 이름이 도착했어요! (${regenCount + 1}/${MAX_REGEN})`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'AI 이름 추천에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsRegenerating(false);
    }
  }, [isRegenerating, canRegenerate, MAX_REGEN, isLoggedIn, generateNamesPublic, router, regenCount]);

  // 로그인 상태 확인
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  const saveResult = trpc.naming.saveResult.useMutation({
    onSuccess: (data) => {
      if (data.saved) {
        setIsSaved(true);
        showToast('저장되었습니다 ✓');
      }
    },
  });

  const handleSaveResult = useCallback(() => {
    if (isGuest) return;
    if (isLoggedIn === false && !SKIP_AUTH) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (isSaved) return;
    saveResult.mutate({ resultId: params.id });
  }, [isGuest, isLoggedIn, isSaved, saveResult, params.id, router]);

  // Fetch real result from DB when id is not 'guest'
  const resultQuery = trpc.naming.getResult.useQuery(
    { id: params.id },
    { enabled: !isGuest }
  );

  // Once real names are loaded, store them and set initial display
  useEffect(() => {
    if (resultQuery.data?.suggested_names) {
      const names = resultQuery.data.suggested_names;
      setRealNames(names);
      // Filter by current length selection, or show all if no match
      const filtered = names.filter(n => String(n.name.length) === filter);
      const source = filtered.length > 0 ? filtered : names;
      const shuffled = shuffle(source);
      setPool(shuffled);
      setOffset(0);
      setDisplayed(shuffled.slice(0, 10));
    }
  }, [resultQuery.data, filter]);

  const popularityQuery = trpc.naming.getNamePopularity.useQuery(
    { names: displayed.map(n => n.name) },
    { enabled: displayed.length > 0 }
  );

  useEffect(() => {
    if (popularityQuery.data) {
      setPopularityMap(prev => ({ ...prev, ...popularityQuery.data }));
    }
  }, [popularityQuery.data]);

  // 게스트 모드: sessionStorage에서 실제 LLM 생성 이름 로드
  useEffect(() => {
    if (isGuest && !realNames) {
      try {
        const stored = sessionStorage.getItem('guest-naming-result');
        if (stored) {
          const parsed = JSON.parse(stored) as SuggestedName[];
          if (parsed.length > 0) {
            setRealNames(parsed);
            return;
          }
        }
      } catch (error) {
        console.error('[NamingResult] 처리 실패:', error);
        // sessionStorage 파싱 실패 시 fallback
      }
    }
  }, [isGuest, realNames]);

  // Build shuffled pool whenever filter changes (real names first, mock fallback only if no data)
  useEffect(() => {
    if (realNames) {
      const filtered = realNames.filter(n => String(n.name.length) === filter);
      const source = filtered.length > 0 ? filtered : realNames;
      const shuffled = shuffle(source);
      setPool(shuffled);
      setOffset(0);
      setDisplayed(shuffled.slice(0, 10));
    } else if (isGuest) {
      // realNames가 아직 로드 안 됐으면 잠시 대기, 없으면 mock fallback
      const newPool = shuffle(ALL_NAMES[filter]);
      setPool(newPool);
      setOffset(0);
      setDisplayed(newPool.slice(0, 10));
    }
  }, [filter, realNames, isGuest]);

  const handleLoadMore = useCallback(async () => {
    // 현재 이름 풀 내에서 아직 안 본 이름 있으면 보여줌
    const basePool = (() => {
      if (realNames) {
        const filtered = realNames.filter(n => String(n.name.length) === filter);
        return filtered.length > 0 ? filtered : realNames;
      }
      return ALL_NAMES[filter];
    })();

    const nextOffset = offset + 10;
    if (nextOffset < basePool.length) {
      setOffset(nextOffset);
      setDisplayed(basePool.slice(nextOffset, nextOffset + 10));
      return;
    }

    // 모든 이름을 다 봤음 → 정보를 다시 입력하도록 안내
    setShowRegeneratePrompt(true);
  }, [offset, filter, realNames]);

  const handleAddCandidate = useCallback((name: SuggestedName) => {
    setCandidates(prev => {
      if (prev.length >= 10) {
        showToast('후보는 최대 10개까지 추가할 수 있어요');
        return prev;
      }
      if (prev.some(c => c.name === name.name)) return prev;
      showToast('⭐ 저장한 이름 후보는 내 프로필에서 확인할 수 있어요');
      return [...prev, name];
    });
  }, []);

  const handleRemoveCandidate = useCallback((name: string) => {
    setCandidates(prev => prev.filter(c => c.name !== name));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleVoice = (name: string) => {
    router.push(`/naming/voice/${encodeURIComponent(name)}`);
  };

  const createVoteSession = trpc.naming.createVoteSession.useMutation();

  // 투표 공유 팝업 상태
  const [showVotePopup, setShowVotePopup] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [voteCandidates, setVoteCandidates] = useState<{ name: string; hanja: string; description: string; sajuScore?: number; element?: string; isCustom: boolean }[]>([]);
  const [voteUrl, setVoteUrl] = useState('');
  const [isCreatingVote, setIsCreatingVote] = useState(false);

  const openVotePopup = useCallback(() => {
    // 기존 후보를 투표 후보로 복사
    setVoteCandidates(candidates.map(c => ({
      name: c.name,
      hanja: c.hanja,
      description: c.reasonShort,
      sajuScore: c.sajuScore,
      element: c.element,
      isCustom: false,
    })));
    setVoteUrl('');
    setCustomName('');
    setCustomDesc('');
    setShowVotePopup(true);
  }, [candidates]);

  const addCustomCandidate = useCallback(() => {
    if (!customName.trim()) return;
    if (voteCandidates.length >= 20) {
      showToast('후보는 최대 20개까지 추가할 수 있어요');
      return;
    }
    if (voteCandidates.some(c => c.name === customName.trim())) {
      showToast('이미 같은 이름이 있어요');
      return;
    }
    setVoteCandidates(prev => [...prev, {
      name: customName.trim(),
      hanja: '',
      description: customDesc.trim(),
      isCustom: true,
    }]);
    setCustomName('');
    setCustomDesc('');
  }, [customName, customDesc, voteCandidates]);

  const removeVoteCandidate = useCallback((name: string) => {
    setVoteCandidates(prev => prev.filter(c => c.name !== name));
  }, []);

  const createVoteLink = useCallback(async () => {
    if (voteCandidates.length === 0) return;
    setIsCreatingVote(true);
    try {
      const result = await createVoteSession.mutateAsync({
        candidates: voteCandidates.map(c => ({
          name: c.name,
          hanja: c.hanja,
          reasonShort: c.description,
          sajuScore: c.sajuScore ?? 0,
          element: c.element ?? 'earth',
        })),
      });
      const url = `${window.location.origin}/naming/vote/${result.shareCode}`;
      setVoteUrl(url);
    } catch (error) {
      console.error('[NamingResult] 처리 실패:', error);
      showToast('투표 링크 생성에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsCreatingVote(false);
    }
  }, [voteCandidates, createVoteSession]);

  const handleKakaoVoteShare = useCallback(() => {
    if (!voteUrl) return;
    if (window.Kakao?.isInitialized?.()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '우리 아이 이름, 어떤 게 좋을까요? 👶',
          description: `${voteCandidates.length}개의 후보 이름에 투표해주세요!`,
          imageUrl: `${window.location.origin}/og-vote.png`,
          link: { mobileWebUrl: voteUrl, webUrl: voteUrl },
        },
        buttons: [
          { title: '투표하러 가기', link: { mobileWebUrl: voteUrl, webUrl: voteUrl } },
        ],
      });
    } else {
      navigator.clipboard.writeText(voteUrl).then(() => {
        showToast('투표 링크가 복사됐어요! 카톡에 붙여넣기 해주세요 🎉');
      });
    }
  }, [voteUrl, voteCandidates]);

  const filterLabels: { key: LengthFilter; label: string }[] = [
    { key: '2', label: '두글자 (기본)' },
    { key: '1', label: '외자 (1글자)' },
  ];

  // 페이지 전체 오행 테마: 현재 표시 이름들 중 가장 많은 오행 사용
  const pageElement = (() => {
    if (displayed.length === 0) return undefined;
    const counts: Record<string, number> = {};
    for (const n of displayed) {
      if (n.element) counts[n.element] = (counts[n.element] ?? 0) + 1;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? (top[0] as import('@/types').Element) : undefined;
  })();

  // Show loading while fetching real result
  if (!isGuest && resultQuery.isLoading) {
    return (
      <CozyPanel padding="lg" className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">이름을 불러오는 중...</p>
      </CozyPanel>
    );
  }

  return (
    <OhengTheme element={pageElement} as="div" className="min-h-screen bg-ivory pb-24">
      {isGuest && <DemoBanner />}

      {/* 헤더 — 코지 그라디언트 배너 */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-400 pt-12 pb-8 px-4 text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm opacity-80 mb-1">AI가 추천하는</p>
          <h1 className="font-display text-2xl">이름 목록</h1>
        </motion.div>
      </div>

      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 -mt-4">
        {/* 결과 저장하기 버튼 */}
        {!isGuest && (
          <div className="flex justify-end mb-3">
            <button
              onClick={handleSaveResult}
              disabled={isSaved || saveResult.isPending}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm',
                isSaved
                  ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                  : 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-50'
              )}
            >
              {isSaved ? (
                <><BookmarkCheck className="w-4 h-4" />저장됨</>
              ) : saveResult.isPending ? (
                <><div className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />저장 중...</>
              ) : (
                <><Bookmark className="w-4 h-4" />결과 저장하기</>
              )}
            </button>
          </div>
        )}

        {/* 글자수 필터 */}
        <CozyPanel padding="sm" className="mb-4 flex gap-2">
          {filterLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
                filter === key
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              {label}
            </button>
          ))}
        </CozyPanel>

        {/* Name cards */}
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 mb-4">
          <AnimatePresence mode="wait">
            {displayed.map((name, i) => (
              <NameCard
                key={`${name.name}-${offset}`}
                name={name}
                index={i}
                isCandidate={candidates.some(c => c.name === name.name)}
                popularity={popularityMap[name.name]}
                surname={surname}
                surnameHanja={surnameHanja}
                lackingElement={lackingElement}
                onAddCandidate={handleAddCandidate}
                onVoice={handleVoice}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* 더 보기 / 재생성 */}
        {showRegeneratePrompt ? (
          <CozyPanel padding="md" className="mb-6 text-center">
            <p className="text-sm text-gray-700 mb-3">
              {canRegenerate
                ? `모든 이름을 확인했어요. 새로운 이름을 뽑아볼까요? (${regenCount}/${MAX_REGEN})`
                : `추천 횟수를 모두 사용했어요.${!isLoggedIn ? ' 로그인하면 더 받을 수 있어요!' : ''}`}
            </p>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating || !canRegenerate}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors mb-2 disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin")} />
              {isRegenerating ? 'AI가 새 이름을 찾고 있어요...' : !canRegenerate ? '추천 횟수 소진' : '새로운 이름 추천받기'}
            </button>
            <button
              onClick={() => router.push('/naming')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              조건 변경하기
            </button>
          </CozyPanel>
        ) : (
          <button
            onClick={handleLoadMore}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-primary-300 text-primary-600 font-medium hover:bg-primary-50 transition-colors mb-6"
          >
            <Shuffle className="w-4 h-4" /> 다른 이름 추천 받기
          </button>
        )}

        {/* Famous Names Panel */}
        {famousNameQuery && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
          <CozyPanel padding="md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">
                🌟 &quot;{famousNameQuery}&quot; 이름의 주인공들
              </h3>
              <button
                onClick={() => setFamousNameQuery(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {famousNamesQuery.isLoading ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                <span className="text-sm text-gray-400">유명인을 찾고 있어요...</span>
              </div>
            ) : famousNamesQuery.data && famousNamesQuery.data.people.length > 0 ? (
              <>
                <div className="space-y-2.5 mb-3">
                  {famousNamesQuery.data.people.map((person, i) => {
                    const categoryEmojis: Record<string, string> = {
                      drama: '📺', movie: '🎬', novel: '📚', celebrity: '⭐',
                      sports: '⚽', history: '🏛️', science: '🔬', politics: '🏢',
                      cartoon: '🎨', music: '🎵',
                    };
                    const emoji = categoryEmojis[person.category] || '✨';
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-gray-800">{person.name}</span>
                            <span className="text-[11px] px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium">
                              {person.categoryLabel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{person.description}</p>
                          {person.work && (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {person.work}{person.actor ? ` (${person.actor})` : ''}
                            </p>
                          )}
                          {person.funFact && (
                            <p className="text-[11px] text-primary-500 mt-0.5 italic">{person.funFact}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <p className="text-xs text-center text-gray-400 italic">
                  {famousNamesQuery.data.funComment}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                아직 유명한 &quot;{famousNameQuery}&quot; 정보를 찾지 못했어요
              </p>
            )}
          </CozyPanel>
          </motion.div>
        )}

        {/* 후보 이름 섹션 */}
        <CozyPanel padding="md" className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base text-gray-800">⭐ 내 후보 이름 ({candidates.length}/10)</h3>
            {candidates.length > 0 && (
              <button
                onClick={() => setCandidates([])}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                전체 삭제
              </button>
            )}
          </div>

          {candidates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              마음에 드는 이름에 ⭐ 후보 추가를 눌러보세요
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {candidates.map(c => (
                <span
                  key={c.name}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                >
                  {surname}{c.name}
                  <button
                    onClick={() => handleRemoveCandidate(c.name)}
                    className="ml-0.5 hover:text-primary-900 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <button
            onClick={openVotePopup}
            disabled={candidates.length === 0}
            className={cn(
              'w-full py-3 rounded-xl font-medium text-sm transition-colors',
              candidates.length > 0
                ? 'bg-secondary-400 text-white hover:bg-secondary-500'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            🗳️ 공유하고 투표받기
          </button>

          <button
            onClick={() => setShowFinalModal(true)}
            disabled={candidates.length === 0}
            className={cn(
              'w-full py-3.5 rounded-2xl font-bold text-sm transition-colors mt-2',
              candidates.length > 0
                ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            ✅ 이름 최종 선택하기
          </button>
        </CozyPanel>

        {/* Bottom nav — 조건 변경 */}
        <div className="space-y-2">
          <button
            onClick={() => router.push('/naming')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            조건 변경해서 다시 추천받기
          </button>
        </div>
      </div>

      {/* Vote Share Popup */}
      <AnimatePresence>
        {showVotePopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowVotePopup(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

              {!voteUrl ? (
                <>
                  <h2 className="text-lg font-black text-gray-800 mb-1">🗳️ 투표 링크 만들기</h2>
                  <p className="text-sm text-gray-400 mb-4">가족·친구에게 공유해서 이름 투표를 받아보세요</p>

                  {/* 현재 후보 목록 */}
                  <div className="space-y-2 mb-4">
                    {voteCandidates.map(c => (
                      <div key={c.name} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">{surname}{c.name}</span>
                            {c.hanja && <span className="text-xs text-gray-400">{c.hanja}</span>}
                            {c.isCustom && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">직접 추가</span>}
                          </div>
                          {c.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{c.description}</p>}
                        </div>
                        <button onClick={() => removeVoteCandidate(c.name)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 직접 이름 추가 */}
                  <div className="bg-primary-50 rounded-2xl p-4 mb-5">
                    <p className="text-sm font-bold text-gray-700 mb-3">✏️ 이름 직접 추가하기</p>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        placeholder="이름 입력 (예: 서윤)"
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        maxLength={5}
                      />
                      <button
                        onClick={addCustomCandidate}
                        disabled={!customName.trim()}
                        className="bg-primary-500 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-primary-600 transition-colors flex-shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={customDesc}
                      onChange={e => setCustomDesc(e.target.value)}
                      placeholder="이름에 대한 설명 (선택)"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
                      maxLength={50}
                    />
                  </div>

                  {/* 투표 링크 만들기 버튼 */}
                  <button
                    onClick={createVoteLink}
                    disabled={voteCandidates.length === 0 || isCreatingVote}
                    className="w-full py-3.5 rounded-2xl bg-secondary-400 text-white font-bold text-sm hover:bg-secondary-500 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {isCreatingVote ? (
                      <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="inline-block">⏳</motion.span> 링크 만드는 중...</>
                    ) : (
                      <>🔗 투표 링크 만들기 ({voteCandidates.length}개 후보)</>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-black text-gray-800 mb-1">✅ 투표 링크가 만들어졌어요!</h2>
                  <p className="text-sm text-gray-400 mb-5">지금 바로 공유하면 더 많은 사람이 함께해요 💕</p>

                  {/* 투표 링크 표시 */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-2">
                    <p className="flex-1 text-xs text-gray-600 truncate font-mono">{voteUrl}</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(voteUrl); showToast('링크가 복사됐어요 ✓'); }}
                      className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 flex-shrink-0"
                    >
                      복사
                    </button>
                  </div>

                  {/* 카톡 투표 초대하기 */}
                  <button
                    onClick={handleKakaoVoteShare}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#FEE500] text-[#3C1E1E] font-bold text-sm hover:brightness-95 transition-all mb-3"
                  >
                    <MessageCircle className="w-5 h-5" />
                    카톡 투표 초대하기
                  </button>

                  <button
                    onClick={() => { setShowVotePopup(false); router.push(`/naming/vote/results/${voteUrl.split('/').pop()}`); }}
                    className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                  >
                    투표 결과 보기 →
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Final Name Modal */}
      <AnimatePresence>
        {showFinalModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowFinalModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-black text-gray-800 mb-1">✨ 최종 이름을 선택해주세요</h2>
              <p className="text-sm text-gray-400 mb-4">선택한 이름으로 사주 보고서를 생성합니다</p>
              <div className="space-y-3">
                {candidates.map(c => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setFinalName(c);
                      setShowFinalModal(false);
                      // 축하 confetti
                      setShowCelebration(true);
                      setTimeout(() => {
                        setShowCelebration(false);
                        router.push(`/naming/report/${params.id}?name=${encodeURIComponent(c.name)}&hanja=${encodeURIComponent(c.hanja)}&surname=${encodeURIComponent(surname)}&final=true`);
                      }, 2500);
                    }}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                      finalName?.name === c.name
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-100 hover:border-primary-200'
                    )}
                  >
                    <div className="text-3xl font-black text-primary-700">{surname}{c.name}</div>
                    <div className="flex-1">
                      <div className="text-gray-400 text-sm">{c.hanja}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.reasonShort}</div>
                    </div>
                    <div className="text-primary-600 font-bold text-lg">{c.sajuScore}점</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && finalName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
          >
            {/* confetti particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 40 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{
                    left: `${5 + (i * 2.3) % 90}%`,
                    backgroundColor: ['#f093fb', '#f5576c', '#4facfe', '#f9ca24', '#43e97b', '#ff6b6b', '#a29bfe', '#fd79a8'][i % 8],
                  }}
                  initial={{ y: -20, opacity: 1, rotate: 0 }}
                  animate={{ y: 800, opacity: 0, rotate: i * 30 }}
                  transition={{ duration: 2 + (i % 4) * 0.4, delay: (i % 12) * 0.05 }}
                />
              ))}
            </div>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4 relative z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">축하합니다!</h2>
              <p className="text-lg font-bold text-primary-600 mb-1">{surname}{finalName.name}</p>
              <p className="text-sm text-gray-500">우리 아이의 이름이 결정되었어요 ✨</p>
              <p className="text-xs text-gray-400 mt-3">사주 보고서를 준비하고 있어요...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 면책 문구 */}
      <div className="mx-4 mb-6">
        <CozyPanel padding="sm">
          <p className="text-xs text-gray-400 leading-relaxed text-center">
            본 서비스의 이름 추천은 전통 성명학 원리와 AI를 결합한 참고 자료입니다.
            최종 작명 시 전문 작명소 상담을 병행하시기를 권장합니다.
            AI 분석 결과에 대한 법적 책임은 지지 않습니다.
          </p>
        </CozyPanel>
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
    </OhengTheme>
  );
}
