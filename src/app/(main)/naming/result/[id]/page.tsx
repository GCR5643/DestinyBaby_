'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Star, X, Shuffle, RefreshCw, BookmarkCheck, Bookmark } from 'lucide-react';
import type { SuggestedName } from '@/types';
import { getElementColor } from '@/lib/utils';
import { DemoBanner } from '@/components/naming/DemoBanner';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import OhengRadarChart from '@/components/saju/OhengRadarChart';
import type { OhengElements } from '@/components/saju/OhengRadarChart';
import { createClient } from '@/lib/supabase/client';
import { SKIP_AUTH } from '@/lib/auth/skip-auth';

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

const THREE_CHAR: SuggestedName[] = [
  { name: '이슬비', hanja: '露霏霏', reasonShort: '이슬비처럼 촉촉하고 부드러운 이름', sajuScore: 89, element: 'water' },
  { name: '햇살이', hanja: '陽光伊', reasonShort: '햇살처럼 따뜻하고 환한 기운', sajuScore: 87, element: 'fire' },
  { name: '온누리', hanja: '溫世理', reasonShort: '온 세상을 따뜻하게 품는 이름', sajuScore: 85, element: 'earth' },
  { name: '한결이', hanja: '一結伊', reasonShort: '한결같은 마음을 담은 이름', sajuScore: 83, element: 'wood' },
  { name: '솔바람', hanja: '松風覽', reasonShort: '솔숲을 스치는 바람처럼 청량한 이름', sajuScore: 88, element: 'wood' },
];

const ALL_NAMES: Record<'1' | '2' | '3', SuggestedName[]> = {
  '1': ONE_CHAR,
  '2': TWO_CHAR,
  '3': THREE_CHAR,
};

type LengthFilter = '1' | '2' | '3';

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

interface NameCardProps {
  name: SuggestedName;
  index: number;
  isCandidate: boolean;
  popularity: PopularityInfo | undefined;
  onAddCandidate: (name: SuggestedName) => void;
  onVoice: (name: string) => void;
  onFamous: (givenName: string) => void;
  isFamousActive: boolean;
}

function NameCard({ name, index, isCandidate, popularity, onAddCandidate, onVoice, onFamous, isFamousActive }: NameCardProps) {
  const elementColor = getElementColor(name.element || 'wood');

  return (
    <motion.div
      key={name.name}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.07 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden"
      style={{ borderTop: `4px solid ${elementColor}` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{name.name}</h2>
            <p className="text-base text-gray-400 mt-0.5">{name.hanja}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: elementColor }}>{name.sajuScore}</div>
            <div className="text-xs text-gray-400">사주 적합도</div>
            <div className="mt-1.5">
              <TrendBadge info={popularity} />
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div className="mb-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${name.sajuScore}%` }}
              transition={{ delay: index * 0.07 + 0.3, duration: 0.8 }}
              className="h-full rounded-full"
              style={{ backgroundColor: elementColor }}
            />
          </div>
        </div>

        {/* 오행 레이더 차트 (소형) */}
        {name.element && (() => {
          const el = name.element!;
          const oheng: OhengElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
          oheng[el] = 3;
          return (
            <div className="flex justify-center mb-3">
              <OhengRadarChart elements={oheng} size={160} showLabels={true} animated={true} />
            </div>
          );
        })()}

        {/* Meaning */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{name.reasonShort}</p>

        <div className="flex gap-2">
          <button
            onClick={() => onVoice(name.name)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
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
                ? 'bg-green-50 text-green-600 cursor-default'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            )}
          >
            <Star className="w-4 h-4" />
            {isCandidate ? '✅ 후보됨' : '⭐ 후보 추가'}
          </button>
        </div>
        <button
          onClick={() => onFamous(name.name)}
          className={cn(
            'w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors',
            isFamousActive
              ? 'bg-amber-50 text-amber-600 border border-amber-200'
              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
          )}
        >
          🌟 이 이름의 유명인 보기
        </button>
      </div>
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
      } catch {
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

  const handleShare = useCallback(async () => {
    if (candidates.length === 0) return;

    try {
      const result = await createVoteSession.mutateAsync({
        candidates: candidates.map(c => ({
          name: c.name,
          hanja: c.hanja,
          reasonShort: c.reasonShort,
          sajuScore: c.sajuScore,
          element: c.element,
        })),
      });

      const voteUrl = `${window.location.origin}/naming/vote/${result.shareCode}`;

      // 카카오톡 공유 시도
      if (window.Kakao?.isInitialized?.()) {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '우리 아이 이름, 어떤 게 좋을까요? 🍼',
            description: `${candidates.length}개의 후보 이름에 투표해주세요!`,
            imageUrl: `${window.location.origin}/og-vote.png`,
            link: { mobileWebUrl: voteUrl, webUrl: voteUrl },
          },
          buttons: [
            { title: '투표하기', link: { mobileWebUrl: voteUrl, webUrl: voteUrl } },
          ],
        });
      } else {
        // 카카오 SDK 없으면 클립보드 복사
        await navigator.clipboard.writeText(voteUrl);
        showToast('투표 링크가 복사됐어요! 카톡에 붙여넣기 해주세요 🎉');
      }
    } catch (e) {
      console.warn('[share] 투표 세션 생성 실패:', e);
      showToast('공유 실패. 다시 시도해주세요.');
    }
  }, [candidates, createVoteSession]);

  const filterLabels: { key: LengthFilter; label: string }[] = [
    { key: '1', label: '외자 (1글자)' },
    { key: '2', label: '두글자 (기본)' },
    { key: '3', label: '세글자+' },
  ];

  // Show loading while fetching real result
  if (!isGuest && resultQuery.isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-gray-400 text-sm">이름을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {isGuest && <DemoBanner />}

      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-400 pt-12 pb-8 px-4 text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm opacity-80 mb-1">AI가 추천하는</p>
          <h1 className="text-2xl font-bold">이름 목록</h1>
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

        {/* Length filter */}
        <div className="bg-white rounded-2xl shadow-md p-3 mb-4 flex gap-2">
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
        </div>

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
                onAddCandidate={handleAddCandidate}
                onVoice={handleVoice}
                onFamous={(givenName) => setFamousNameQuery(prev => prev === givenName ? null : givenName)}
                isFamousActive={famousNameQuery === name.name}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Load more / Regenerate */}
        {showRegeneratePrompt ? (
          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 mb-6 text-center">
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
          </div>
        ) : (
          <button
            onClick={handleLoadMore}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-primary-300 text-primary-600 font-medium hover:bg-primary-50 transition-colors mb-6"
          >
            <Shuffle className="w-4 h-4" /> 더 뽑아보기 🎲
          </button>
        )}

        {/* Famous Names Panel */}
        {famousNameQuery && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-5 mb-4"
          >
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
          </motion.div>
        )}

        {/* Candidate section */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">⭐ 내 후보 이름 ({candidates.length}/10)</h3>
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
                  {c.name}
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
            onClick={handleShare}
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
        </div>

        {/* Bottom nav — 재생성 */}
        <div className="space-y-2">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating || !canRegenerate}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-primary-300 text-primary-600 font-medium hover:bg-primary-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin")} />
            {isRegenerating
              ? 'AI가 새 이름을 찾고 있어요...'
              : !canRegenerate
              ? `추천 횟수를 모두 사용했어요 (${MAX_REGEN}/${MAX_REGEN})`
              : `다시 추천받기 (${regenCount}/${MAX_REGEN})`}
          </button>
          {!canRegenerate && !isLoggedIn && (
            <button
              onClick={() => router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm text-primary-500 hover:bg-primary-50 transition-colors"
            >
              로그인하면 {5}회까지 추천받을 수 있어요 →
            </button>
          )}
          <button
            onClick={() => router.push('/naming')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            조건 변경해서 다시 추천받기
          </button>
        </div>
      </div>

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
                      router.push(`/naming/report/${params.id}?name=${encodeURIComponent(c.name)}&hanja=${encodeURIComponent(c.hanja)}&final=true`);
                    }}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                      finalName?.name === c.name
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-100 hover:border-primary-200'
                    )}
                  >
                    <div className="text-3xl font-black text-primary-700">{c.name}</div>
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
