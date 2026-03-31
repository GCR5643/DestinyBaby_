'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Download, Loader2, Stars } from 'lucide-react';
import type { NamingReport, Element } from '@/types';
import { trpc } from '@/lib/trpc/client';
import OhengRadarChart from '@/components/saju/OhengRadarChart';
import OhengBalanceBar from '@/components/saju/OhengBalanceBar';
import type { OhengElements } from '@/components/saju/OhengRadarChart';
import { ELEMENT_COLOR_CLASS, ELEMENT_ICON, recommendCareers } from '@/lib/saju/career-matcher';
import type { CareerRecommendation } from '@/lib/saju/career-matcher';
import { calculateSaju } from '@/lib/saju/saju-calculator';

function ScoreCircle({ score, label, size = 'md' }: { score: number; label: string; size?: 'md' | 'lg' }) {
  const isLg = size === 'lg';
  const r = isLg ? 52 : 36;
  const dim = isLg ? 120 : 80;
  const svgSize = isLg ? 'w-32 h-32' : 'w-24 h-24';
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${isLg ? 'w-32 h-32' : 'w-24 h-24'}`}>
        <svg className={`${svgSize} -rotate-90`} viewBox={`0 0 ${dim} ${dim}`}>
          <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={isLg ? 8 : 6} />
          <motion.circle
            cx={dim / 2} cy={dim / 2} r={r}
            fill="none"
            stroke="#6C5CE7"
            strokeWidth={isLg ? 8 : 6}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold text-primary-600 ${isLg ? 'text-3xl' : 'text-xl'}`}>{score}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1 text-center">{label}</p>
    </div>
  );
}

// 오행 진행 바 색상
const ELEMENT_BAR_COLOR: Record<string, string> = {
  wood:  '#22c55e',
  fire:  '#ef4444',
  earth: '#eab308',
  metal: '#94a3b8',
  water: '#3b82f6',
};

// 자원오행 element → 한국어
const ELEMENT_KR: Record<string, string> = {
  wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
};

function ElementBadge({ element }: { element: string }) {
  const color = ELEMENT_BAR_COLOR[element] ?? '#9ca3af';
  const label = ELEMENT_KR[element] ?? element;
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

const ELEMENT_RECOMMENDATIONS: Record<string, {
  colors: string[];
  colorDesc: string;
  nature: string;
  natureDesc: string;
  travel: string[];
  travelDesc: string;
  season: string;
  seasonDesc: string;
}> = {
  water: {
    colors: ['네이비', '인디고', '청록', '딥블루'],
    colorDesc: '물의 기운을 담은 깊고 차분한 색감',
    nature: '바다 · 강 · 호수',
    natureDesc: '물가 가까이서 에너지를 충전해요',
    travel: ['제주도 해변', '동해 바다', '노르웨이 피오르드'],
    travelDesc: '물의 기운이 풍부한 곳에서 크게 성장해요',
    season: '겨울',
    seasonDesc: '고요하고 깊은 겨울 에너지와 잘 맞아요',
  },
  wood: {
    colors: ['초록', '민트', '연두', '올리브'],
    colorDesc: '생명력 넘치는 자연의 초록 계열',
    nature: '숲 · 공원 · 정원',
    natureDesc: '나무와 풀 가까이서 맑은 기운을 얻어요',
    travel: ['제주 숲길', '뉴질랜드', '캐나다 록키'],
    travelDesc: '울창한 숲과 자연이 있는 곳이 최고예요',
    season: '봄',
    seasonDesc: '새싹이 돋는 봄에 가장 빛나요',
  },
  fire: {
    colors: ['레드', '오렌지', '코랄', '버건디'],
    colorDesc: '열정과 활력을 북돋는 따뜻한 색감',
    nature: '햇살 · 양지 · 고원',
    natureDesc: '햇볕이 잘 드는 밝은 공간에서 에너지가 솟아요',
    travel: ['스페인 바르셀로나', '그리스 산토리니', '제주 오름'],
    travelDesc: '햇살 가득한 남유럽과 지중해가 잘 맞아요',
    season: '여름',
    seasonDesc: '뜨거운 여름이 에너지를 가장 높여줘요',
  },
  earth: {
    colors: ['베이지', '카키', '갈색', '테라코타'],
    colorDesc: '안정감과 포근함을 주는 대지의 색',
    nature: '산 · 들판 · 고원',
    natureDesc: '넓은 대지와 산에서 든든한 기운을 얻어요',
    travel: ['경주', '전주 한옥마을', '스위스 알프스'],
    travelDesc: '유서 깊은 땅과 웅장한 산이 잘 맞아요',
    season: '환절기 (봄끝·여름끝)',
    seasonDesc: '계절이 바뀌는 사이 특별한 기운이 생겨요',
  },
  metal: {
    colors: ['화이트', '실버', '라이트그레이', '골드'],
    colorDesc: '깔끔하고 세련된 메탈릭 · 무채색 계열',
    nature: '바위산 · 고산 · 도심',
    natureDesc: '높은 곳에서 맑은 공기와 함께 에너지를 얻어요',
    travel: ['일본 교토', '스위스 융프라우', '아이슬란드'],
    travelDesc: '서늘하고 깨끗한 북쪽 나라가 잘 맞아요',
    season: '가을',
    seasonDesc: '선선한 가을 하늘 아래서 가장 빛나요',
  },
};

const milestones = [
  { age: '유아기 (0~7세)', icon: '🌱', title: '씨앗이 싹트는 시기', desc: '호기심 가득한 눈으로 세상을 탐험해요. 자유롭게 뛰어놀고 상상력을 마음껏 펼쳐주세요.' },
  { age: '학창시절 (8~18세)', icon: '📚', title: '뿌리를 내리는 시기', desc: '재능이 서서히 드러나는 시기예요. 한 가지 분야에 깊이 빠져보는 경험이 평생의 강점이 됩니다.' },
  { age: '청년기 (19~30세)', icon: '🌿', title: '가지를 뻗는 시기', desc: '세상과 적극적으로 만나는 황금기예요. 두려움 없이 도전하면 운이 활짝 열립니다.' },
  { age: '장년기 (31~50세)', icon: '🌳', title: '꽃이 피는 시기', desc: '쌓아온 경험이 빛을 발하는 시기예요. 주변에 든든한 나무가 되어줄 운명입니다.' },
];

export default function NamingReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromReview = searchParams.get('from') === 'review';
  const [isPurchased, setIsPurchased] = useState(fromReview);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // DB에서 실제 리포트 조회
  const reportQuery = trpc.naming.getReport.useQuery({ id: params.id });
  const dbReport = reportQuery.data;

  // DB 데이터가 있으면 사용, 없으면 URL 파라미터 + fallback
  const nameFromUrl = searchParams.get('name') || '지우';
  const hanjaFromUrl = searchParams.get('hanja') || '智宇';
  const name = dbReport?.selectedName ?? nameFromUrl;
  const hanja = dbReport?.selectedHanja ?? hanjaFromUrl;
  const isDemo = !reportQuery.isLoading && !dbReport;

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await fetch(`/api/naming-report/pdf?id=${params.id}`);
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}_작명보고서.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const popularityQuery = trpc.naming.getNamePopularity.useQuery(
    { names: [name] },
    { enabled: !!name }
  );
  const popularity = popularityQuery.data?.[name];

  // DB 데이터가 없을 때만 사용하는 fallback mockReport
  const fallbackReport: NamingReport = {
    name, hanja,
    strokeAnalysis: { totalStrokes: 18, heavenGrade: 12, humanGrade: 18, earthGrade: 6, outerGrade: 12, totalGrade: 18, luckScore: 88 },
    yinYangFiveElements: { elements: ['water', 'wood'], balance: '균형잡힌', recommendation: '오행이 조화롭게 배합되어 있습니다' },
    pronunciationAnalysis: { harmony: 92, initialConsonants: ['ㅈ', 'ㅇ'], comment: '자음과 모음의 조화가 훌륭합니다. 부르기 쉽고 듣기 좋은 이름입니다.' },
    meaningBreakdown: [
      { char: name[0] ?? '지', hanja: hanja[0] ?? '智', meaning: '지혜로울 지 — 총명하고 지혜로운 사람이 됩니다' },
      { char: name[1] ?? '우', hanja: hanja[1] ?? '宇', meaning: '집 우 — 드넓은 세상을 품는 큰 사람이 됩니다' },
    ],
    sajuFitScore: 92,
    parentCompatibility: { mom: 88, dad: 91, combined: 90 },
    overallComment: `"${name}"는 아이의 사주에 완벽하게 어울리는 이름입니다. 지혜와 넓은 마음을 가진 사람으로 성장할 것입니다. 부모님의 기운과도 매우 잘 어울려, 가족 전체가 행복하고 건강한 삶을 누릴 것으로 보입니다.`,
    eumyangAnalysis: {
      pattern: ['양', '음'],
      patternString: '양음',
      score: 85,
      luck: '길',
      description: '양과 음이 조화롭게 배합되어 균형 잡힌 기운을 지닙니다.',
    },
    pronunciationOheng: {
      elements: ['木', '水'],
      pattern: '목-수',
      relations: ['상생'],
      score: 90,
      description: '초성의 오행이 상생하여 발음이 힘차고 조화롭습니다.',
    },
    jawonOheng: {
      elements: ['water', 'wood'],
      matchCount: 2,
      generateCount: 1,
      score: 88,
    },
    bulyongCheck: {
      passed: true,
      issues: [],
      score: 100,
    },
    expertScore: 90,
  };

  const report: NamingReport = dbReport?.reportData ?? fallbackReport;

  // 전문가 종합 점수: expertScore 없으면 sajuFitScore fallback
  const mainScore = report.expertScore ?? report.sajuFitScore;

  const mainElement = (report.yinYangFiveElements.elements[0] ?? 'water') as string;
  const elemRec = ELEMENT_RECOMMENDATIONS[mainElement] ?? ELEMENT_RECOMMENDATIONS.water;

  // 오행 차트용: yinYangFiveElements.elements 배열에서 개수 집계
  const ohengElements: OhengElements = (() => {
    const counts: OhengElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    for (const el of report.yinYangFiveElements.elements) {
      const key = el as Element;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  })();

  const elementDescMap: Record<string, string> = {
    water: '지혜롭고 깊은 통찰력',
    wood: '생명력 넘치는 따뜻한 마음',
    fire: '밝고 열정적인 에너지',
    earth: '든든하고 믿음직한 기운',
    metal: '날카롭고 순수한 감성',
  };
  const elementDesc = elementDescMap[mainElement] ?? '아름다운 기운';

  const blessingMessage = `사랑스러운 ${name}이(가) 이 세상에 태어나 주어 감사해요. ${name}의 사주는 ${elementDesc}을 품고 있어요. 부모님의 사랑을 듬뿍 받으며, 자신만의 아름다운 길을 걸어갈 거예요. ✨`;

  // 직업 추천: 오행 분포 기반 SajuResult 구성 후 다차원 추천
  const ELEMENT_TO_YANG_STEM: Record<string, string> = {
    wood: '갑', fire: '병', earth: '무', metal: '경', water: '임',
  };
  const ELEMENT_TO_YIN_BRANCH: Record<string, string> = {
    wood: '인', fire: '사', earth: '축', metal: '유', water: '자',
  };
  const reportElements = report.yinYangFiveElements.elements as string[];
  const allEls: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  const elCounts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const el of reportElements) { if (el in elCounts) elCounts[el]++; }
  const elSorted = allEls.slice().sort((a, b) => (elCounts[b] ?? 0) - (elCounts[a] ?? 0));
  const reportMainEl = (elSorted[0] ?? mainElement) as Element;
  const reportLackEl = (elSorted[elSorted.length - 1] ?? 'earth') as Element;
  const dayStem = ELEMENT_TO_YANG_STEM[reportMainEl] ?? '갑';
  const syntheticSaju = calculateSaju('2000-01-01');
  const syntheticForReport = {
    ...syntheticSaju,
    dayPillar: {
      heavenlyStem: dayStem,
      earthlyBranch: ELEMENT_TO_YIN_BRANCH[reportMainEl] ?? '인',
      element: reportMainEl,
      yin_yang: 'yang' as const,
    },
    mainElement: reportMainEl,
    lackingElement: reportLackEl,
    strongElements: elSorted.slice(0, 2) as Element[],
    weakElements: elSorted.slice(3) as Element[],
  };
  const careerRecommendations: CareerRecommendation[] = recommendCareers(syntheticForReport);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    // TODO: Toss/Naver/Stripe payment
    await new Promise(r => setTimeout(r, 1500));
    setIsPurchased(true);
    setIsPurchasing(false);
  };

  // 로딩 중 스켈레톤 UI
  if (reportQuery.isLoading) {
    return (
      <div className="min-h-screen bg-ivory pb-24">
        <div className="bg-gradient-to-br from-primary-600 to-primary-400 pt-12 pb-8 px-4 text-white text-center">
          <div className="h-8 w-40 bg-white/30 rounded-lg mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-24 bg-white/20 rounded mx-auto animate-pulse" />
        </div>
        <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 mt-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
              <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
              <div className="flex justify-around">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full bg-gray-200" />
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isPurchased) {
    return (
      <div className="min-h-screen bg-ivory pb-24">
        <div className="bg-gradient-to-br from-primary-600 to-primary-400 pt-12 pb-8 px-4 text-white text-center">
          <h1 className="text-2xl font-bold mb-1">상세 이름 리포트</h1>
          <p className="text-sm opacity-80">{name} ({hanja})</p>
        </div>

        <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 mt-6">
          <div className="bg-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-2xl">
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🔒</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">사주 인생 보고서</h2>
                <p className="text-gray-500 text-sm mb-6">
                  축복 메시지, 오행 인생 추천, 인생 이정표,<br />
                  한자 풀이, 종합 작명 소견까지!
                </p>
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full bg-gradient-to-r from-gold-400 to-gold-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  {isPurchasing ? (
                    <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />결제 중...</>
                  ) : (
                    <><CreditCard className="w-5 h-5" />📖 사주 인생 보고서 보기 — 3,000원</>
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-2">토스페이 · 네이버페이 · 카드 결제</p>
              </div>
            </div>
            {/* Blurred preview */}
            <div className="filter blur-sm space-y-4">
              <div className="flex justify-around">
                <ScoreCircle score={92} label="사주 적합도" />
                <ScoreCircle score={88} label="엄마 궁합" />
                <ScoreCircle score={91} label="아빠 궁합" />
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-2">오행 인생 추천</h3>
                <div className="grid grid-cols-2 gap-2 text-center">
                  {['행운의 색깔', '자연과의 친구', '여행지 추천', '행운의 계절'].map(g => (
                    <div key={g} className="bg-white rounded-lg p-2">
                      <div className="text-sm font-bold text-primary-600">??</div>
                      <div className="text-xs text-gray-400">{g}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="bg-gradient-to-br from-primary-600 to-primary-400 pt-12 pb-8 px-4 text-white text-center">
        <h1 className="text-2xl font-bold mb-1">{name}{hanja ? ` (${hanja})` : ''}</h1>
        <p className="text-sm opacity-80">{fromReview ? '이름 평가 보고서' : '사주 인생 보고서'}</p>
        {fromReview && (
          <div className="mt-3 inline-block bg-white/20 rounded-full px-4 py-1 text-xs font-medium">
            📊 이미 지은 이름 분석 결과
          </div>
        )}
      </div>

      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 -mt-4 space-y-4">

        {/* 데모 데이터 배너 */}
        {isDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>데모 데이터입니다. 실제 분석 결과가 저장되지 않았습니다.</span>
          </div>
        )}

        {/* PDF 다운로드 */}
        <div className="flex justify-end">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 bg-white text-primary-600 border border-primary-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-primary-50 transition-colors disabled:opacity-60"
          >
            {isDownloadingPdf ? (
              <><Loader2 className="w-4 h-4 animate-spin" />PDF 생성 중...</>
            ) : (
              <><Download className="w-4 h-4" />PDF 다운로드</>
            )}
          </button>
        </div>

        {/* Section 1: 전문가 종합 점수 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Stars className="w-5 h-5 text-gold-400" />전문가 종합 점수
          </h2>

          {/* 메인 점수 원 */}
          <div className="flex justify-center mb-6">
            <ScoreCircle score={mainScore} label="전문가 종합" size="lg" />
          </div>

          {/* 5개 가중치 세부 항목 */}
          <div className="space-y-3 mb-6">
            {[
              { label: '자원오행', weight: '40%', score: report.jawonOheng?.score ?? report.sajuFitScore, element: 'wood' },
              { label: '발음오행', weight: '25%', score: report.pronunciationOheng?.score ?? report.pronunciationAnalysis.harmony, element: 'fire' },
              { label: '수리오행', weight: '20%', score: report.strokeAnalysis.luckScore, element: 'earth' },
              { label: '음양배합', weight: '10%', score: report.eumyangAnalysis?.score ?? 80, element: 'metal' },
              { label: '불용한자', weight: '5%', score: report.bulyongCheck?.score ?? 100, element: 'water' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-20 shrink-0">
                  <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                  <span className="text-xs text-gray-400 ml-1">({item.weight})</span>
                </div>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: ELEMENT_BAR_COLOR[item.element] ?? '#6C5CE7' }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 w-8 text-right shrink-0">{item.score}</span>
              </div>
            ))}
          </div>

          {/* 보조 점수: 사주 적합도 + 부모 궁합 */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-3 text-center">사주 궁합 보조 지표</p>
            <div className="flex justify-around">
              <ScoreCircle score={report.sajuFitScore} label="사주 적합도" />
              <ScoreCircle score={report.parentCompatibility.mom} label="엄마 궁합" />
              <ScoreCircle score={report.parentCompatibility.dad} label="아빠 궁합" />
            </div>
          </div>
        </motion.div>

        {/* Section: 사주 원국 해석 */}
        {report.sajuNarrative && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="font-bold text-gray-800 mb-1">🔮 아이의 사주 원국 해석</h2>
            <p className="text-xs text-gray-400 mb-4">태어난 순간의 천지 기운으로 읽는 아이의 타고난 기질</p>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{report.sajuNarrative}</p>
            </div>
          </motion.div>
        )}

        {/* Section: 용신 분석 */}
        {report.yongshinAnalysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="font-bold text-gray-800 mb-1">⚖️ 용신(用神) 분석</h2>
            <p className="text-xs text-gray-400 mb-4">아이의 사주에 가장 필요한 기운과 그 의미</p>
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{report.yongshinAnalysis}</p>
            </div>
          </motion.div>
        )}

        {/* Section: 이름-사주 연결 */}
        {report.nameEnergyStory && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}
            className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-100"
          >
            <h2 className="font-bold text-gray-800 mb-1">🌊 이름이 사주를 완성하는 원리</h2>
            <p className="text-xs text-gray-400 mb-4">"{name}" 이라는 이름이 아이의 사주에 어떤 기운을 더해주는지</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{report.nameEnergyStory}</p>
          </motion.div>
        )}

        {/* Section 2: 자원오행 분석 */}
        {report.jawonOheng && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="font-bold text-gray-800 mb-1">🌿 자원오행 분석</h2>
            <p className="text-xs text-gray-400 mb-4">한자 글자의 의미와 형태에 담긴 오행 기운 (가중치 40%)</p>

            {/* 각 글자별 오행 배지 */}
            <div className="flex gap-3 mb-4 flex-wrap">
              {report.meaningBreakdown.map((item, i) => {
                const el = report.jawonOheng!.elements[i];
                return (
                  <div key={i} className="flex-1 min-w-24 bg-gray-50 rounded-2xl p-3 text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">{item.hanja}</div>
                    <div className="text-sm text-gray-700 mb-2">{item.char}</div>
                    {el ? (
                      <ElementBadge element={el} />
                    ) : (
                      <span className="text-xs text-gray-400">미확인</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 매칭 통계 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-green-600">{report.jawonOheng.matchCount}</div>
                <div className="text-xs text-gray-500">용신 일치 글자</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{report.jawonOheng.generateCount}</div>
                <div className="text-xs text-gray-500">상생 관계 글자</div>
              </div>
            </div>

            {/* 불용한자 경고 */}
            {report.bulyongCheck && !report.bulyongCheck.passed && report.bulyongCheck.issues.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="text-xs font-bold text-red-600 mb-2">⚠️ 불용한자 주의</div>
                {report.bulyongCheck.issues.map((issue, i) => (
                  <div key={i} className="text-xs text-red-700 mb-1">
                    <span className="font-semibold">{issue.hanja}</span> ({issue.reading}): {issue.reason}
                  </div>
                ))}
              </div>
            )}
            {report.bulyongCheck?.passed && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                <span className="text-green-600 text-sm">✓</span>
                <span className="text-xs text-green-700 font-medium">불용한자 없음 — 모든 글자가 좋은 의미를 지닙니다</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Section 3: 발음오행 분석 */}
        {report.pronunciationOheng && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="font-bold text-gray-800 mb-1">🔊 발음오행 분석</h2>
            <p className="text-xs text-gray-400 mb-4">초성(첫소리)의 오행과 음절 간 상생·상극 관계 (가중치 25%)</p>

            {/* 초성 → 오행 시각화 */}
            <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
              {report.pronunciationOheng.elements.map((el, i) => {
                const consonant = report.pronunciationAnalysis.initialConsonants[i];
                const elKey = el === '木' ? 'wood' : el === '火' ? 'fire' : el === '土' ? 'earth' : el === '金' ? 'metal' : 'water';
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-gray-700">{consonant ?? '·'}</span>
                    <span className="text-xs text-gray-400">↓</span>
                    <ElementBadge element={elKey} />
                    {i < report.pronunciationOheng!.elements.length - 1 && (
                      <span className="text-xs text-gray-300 mt-1">→</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 상생/상극 관계 */}
            {report.pronunciationOheng.relations.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {report.pronunciationOheng.relations.map((rel, i) => (
                  <span key={i} className={`px-3 py-1 rounded-full text-xs font-semibold ${rel.includes('상생') ? 'bg-green-100 text-green-700' : rel.includes('상극') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {rel}
                  </span>
                ))}
              </div>
            )}

            {/* 점수 + 코멘트 */}
            <div className="flex items-center gap-3 bg-primary-50 rounded-xl p-3">
              <div className="text-2xl font-black text-primary-600">{report.pronunciationOheng.score}</div>
              <p className="text-xs text-primary-800 leading-relaxed flex-1">{report.pronunciationOheng.description}</p>
            </div>
          </motion.div>
        )}

        {/* Section 4: 축복 편지 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl p-6 border border-rose-100 bg-gradient-to-br from-rose-50 to-primary-50"
        >
          <h2 className="font-bold text-gray-800 mb-3">✨ {name}에게 보내는 축복 편지</h2>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {report.blessingLetter ?? blessingMessage}
          </p>
        </motion.div>

        {/* Section 5: 이름 한자 심층 분석 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="font-bold text-gray-800 mb-1">📖 이름 한자 심층 분석</h2>
          <p className="text-xs text-gray-400 mb-4">각 글자에 담긴 의미, 유래, 그리고 문화적 배경</p>
          <div className="space-y-4">
            {(report.characterDeepDive ?? report.meaningBreakdown).map((item, i) => {
              const deep = report.characterDeepDive?.[i];
              return (
                <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="flex items-start gap-4 p-4 bg-gray-50">
                    <div className="text-center min-w-14">
                      <div className="text-3xl font-bold text-primary-600">{item.hanja}</div>
                      <div className="text-base text-gray-700 mt-1">{item.char}</div>
                    </div>
                    <p className="text-sm text-gray-700 pt-1 leading-relaxed">{item.meaning}</p>
                  </div>
                  {deep && (
                    <div className="p-4 space-y-3">
                      {deep.etymology && (
                        <div>
                          <div className="text-xs font-bold text-amber-600 mb-1">📜 한자의 유래</div>
                          <p className="text-xs text-gray-600 leading-relaxed">{deep.etymology}</p>
                        </div>
                      )}
                      {deep.culturalNote && (
                        <div>
                          <div className="text-xs font-bold text-indigo-600 mb-1">🏛️ 문화적 의미</div>
                          <p className="text-xs text-gray-600 leading-relaxed">{deep.culturalNote}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Section 6: 수리오행 (5격 분석) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="font-bold text-gray-800 mb-1">🔢 수리오행 (5격 분석)</h2>
          <p className="text-xs text-gray-400 mb-4">획수로 보는 다섯 가지 운격 (가중치 20%)</p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label: '천격', value: report.strokeAnalysis.heavenGrade },
              { label: '인격', value: report.strokeAnalysis.humanGrade },
              { label: '지격', value: report.strokeAnalysis.earthGrade },
              { label: '외격', value: report.strokeAnalysis.outerGrade },
              { label: '총격', value: report.strokeAnalysis.totalGrade },
              { label: '운세점수', value: report.strokeAnalysis.luckScore },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-primary-600">{item.value}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 bg-primary-50 rounded-xl p-3 text-sm text-primary-800">
            {report.yinYangFiveElements.recommendation}
          </div>
        </motion.div>

        {/* Section 7: 음양배합 분석 */}
        {report.eumyangAnalysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="font-bold text-gray-800 mb-1">☯️ 음양배합 분석</h2>
            <p className="text-xs text-gray-400 mb-4">획수의 홀짝으로 보는 음양 균형 (가중치 10%)</p>

            {/* 획수 패턴 시각화 */}
            <div className="flex items-center gap-2 mb-4">
              {report.eumyangAnalysis.pattern.map((p, i) => (
                <div key={i} className={`flex-1 py-3 rounded-xl text-center font-bold text-sm ${p === '양' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                  {p}
                  <div className="text-xs font-normal mt-0.5 opacity-70">{p === '양' ? '홀수' : '짝수'}</div>
                </div>
              ))}
            </div>

            {/* 패턴 분류 + 점수 */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-3">
              <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                report.eumyangAnalysis.luck === '길' ? 'bg-green-100 text-green-700' :
                report.eumyangAnalysis.luck === '흉' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {report.eumyangAnalysis.luck}
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-0.5">배합 패턴: <span className="font-semibold text-gray-700">{report.eumyangAnalysis.patternString}</span></div>
                <div className="text-xs text-gray-500">점수: <span className="font-bold text-primary-600">{report.eumyangAnalysis.score}점</span></div>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed bg-primary-50 rounded-xl p-3">{report.eumyangAnalysis.description}</p>
          </motion.div>
        )}

        {/* Section: 부모 궁합 상세 해석 */}
        {report.parentCompatibilityNarrative && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }} className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="font-bold text-gray-800 mb-1">👨‍👩‍👧 부모-아이 궁합 상세 해석</h2>
            <p className="text-xs text-gray-400 mb-4">엄마·아빠 각각의 오행이 아이와 어떤 관계를 이루는지</p>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-pink-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-pink-500">{report.parentCompatibility.mom}</div>
                <div className="text-xs text-gray-500 mt-1">엄마 궁합</div>
              </div>
              <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-blue-500">{report.parentCompatibility.dad}</div>
                <div className="text-xs text-gray-500 mt-1">아빠 궁합</div>
              </div>
              <div className="flex-1 bg-purple-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-purple-500">{report.parentCompatibility.combined}</div>
                <div className="text-xs text-gray-500 mt-1">종합</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{report.parentCompatibilityNarrative}</p>
            </div>
          </motion.div>
        )}

        {/* 유행지수 */}
        {popularity && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="bg-white rounded-2xl p-5 shadow-md"
          >
            <h2 className="font-bold text-gray-800 mb-3">📊 이름 유행지수</h2>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-3xl font-black text-primary-600">
                    {popularity.recentCount.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">명 / 이번 달</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (popularity.recentCount / 2500) * 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      popularity.trend === 'rising' ? 'bg-rose-400' :
                      popularity.trend === 'falling' ? 'bg-blue-300' :
                      popularity.trend === 'new' ? 'bg-violet-400' : 'bg-primary-400'
                    }`}
                  />
                </div>
              </div>
              <div className={`px-3 py-2 rounded-2xl text-center min-w-16 ${
                popularity.trend === 'rising' ? 'bg-rose-50 text-rose-600' :
                popularity.trend === 'falling' ? 'bg-blue-50 text-blue-500' :
                popularity.trend === 'new' ? 'bg-violet-50 text-violet-600' : 'bg-gray-50 text-gray-600'
              }`}>
                <div className="text-xl">
                  {popularity.trend === 'rising' ? '🔥' :
                   popularity.trend === 'falling' ? '↓' :
                   popularity.trend === 'new' ? '✨' : '→'}
                </div>
                <div className="text-xs font-semibold mt-0.5">
                  {popularity.trend === 'rising' ? '인기 상승' :
                   popularity.trend === 'falling' ? '감소중' :
                   popularity.trend === 'new' ? '신규 트렌드' : '안정적'}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-xl p-3">
              {popularity.trend === 'rising'
                ? `"${name}"은 요즘 부모님들 사이에서 인기가 빠르게 오르고 있는 이름이에요. 트렌디하면서도 의미 있는 이름을 원하는 분들이 많이 선택하고 있어요.`
                : popularity.trend === 'new'
                ? `"${name}"은 최근에 주목받기 시작한 신선한 이름이에요. 개성 있는 이름을 원하신다면 좋은 선택이 될 수 있어요.`
                : popularity.trend === 'falling'
                ? `"${name}"은 다소 클래식한 분위기의 이름이에요. 유행을 타지 않는 이름을 원하신다면 오히려 장점이 될 수 있어요.`
                : `"${name}"은 꾸준히 사랑받는 안정적인 이름이에요. 너무 흔하지도, 너무 낯설지도 않아 균형감이 좋아요.`
              }
            </p>
          </motion.div>
        )}

        {/* 오행 레이더 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }} className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="font-bold text-gray-800 mb-4">🌐 오행 레이더 분석</h2>
          <div className="flex justify-center mb-4">
            <OhengRadarChart elements={ohengElements} size={240} />
          </div>
          <OhengBalanceBar elements={ohengElements} />
          <div className="mt-3 p-3 bg-primary-50 rounded-xl text-sm text-primary-800">
            {report.yinYangFiveElements.recommendation}
          </div>
        </motion.div>

        {/* 오행 인생 추천 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="font-bold text-gray-800 mb-4">🎨 오행 인생 추천</h2>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-rose-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎨</span>
                <span className="font-bold text-gray-800 text-sm">행운의 색깔</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{elemRec.colorDesc}</p>
              <div className="flex flex-wrap gap-1.5">
                {elemRec.colors.map(c => (
                  <span key={c} className="px-2.5 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">{c}</span>
                ))}
              </div>
            </div>
            <div className="bg-green-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🌿</span>
                <span className="font-bold text-gray-800 text-sm">자연과의 친구</span>
              </div>
              <p className="text-sm font-semibold text-green-700 mb-1">{elemRec.nature}</p>
              <p className="text-xs text-gray-500">{elemRec.natureDesc}</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">✈️</span>
                <span className="font-bold text-gray-800 text-sm">여행지 추천</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{elemRec.travelDesc}</p>
              <div className="flex flex-wrap gap-1.5">
                {elemRec.travel.map(t => (
                  <span key={t} className="px-2.5 py-1 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm">{t}</span>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🍂</span>
                <span className="font-bold text-gray-800 text-sm">행운의 계절</span>
              </div>
              <p className="text-sm font-semibold text-amber-700 mb-1">{elemRec.season}</p>
              <p className="text-xs text-gray-500">{elemRec.seasonDesc}</p>
            </div>
          </div>
        </motion.div>

        {/* 인생 이정표 (개인화) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="font-bold text-gray-800 mb-1">🌟 {name}의 인생 이정표</h2>
          <p className="text-xs text-gray-400 mb-4">사주 기반으로 예측한 시기별 성장 가이드</p>
          <div className="space-y-3">
            {(report.personalizedMilestones ?? milestones.map(m => ({ age: m.age, icon: m.icon, title: m.title, description: m.desc }))).map((m, i) => (
              <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="text-2xl">{m.icon}</div>
                <div className="flex-1">
                  <div className="text-xs text-primary-500 font-semibold mb-0.5">{m.age}</div>
                  <div className="font-bold text-gray-800 text-sm mb-1">{m.title}</div>
                  <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 종합 작명 소견 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-100"
        >
          <h2 className="font-bold text-gray-800 mb-3">💫 종합 작명 소견</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{report.overallComment}</p>
        </motion.div>

        {/* review 경로: 점수 낮을 때 대안 이름 추천 CTA */}
        {fromReview && report.sajuFitScore < 70 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200"
          >
            <div className="text-3xl mb-2">💡</div>
            <h3 className="font-black text-gray-800 text-lg mb-1">사주 적합도가 낮아요</h3>
            <p className="text-gray-500 text-sm mb-4">
              현재 이름의 사주 적합도가 {report.sajuFitScore}점으로 다소 낮습니다.<br />
              AI가 추천하는 더 잘 맞는 이름을 확인해보세요.
            </p>
            <button
              onClick={() => router.push('/naming')}
              className="w-full bg-amber-500 text-white py-3 rounded-2xl font-bold hover:bg-amber-600 transition-colors"
            >
              ✨ 대안 이름 추천받기
            </button>
          </motion.div>
        )}

        {/* review 경로: 사주 상세 리포트 보기 CTA */}
        {fromReview && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
            className="bg-gradient-to-br from-primary-600 to-primary-400 rounded-2xl p-6 text-center"
          >
            <div className="text-3xl mb-2">📖</div>
            <h3 className="text-white font-black text-lg mb-1">사주 인생 보고서도 받아보세요</h3>
            <p className="text-white/70 text-sm mb-4">
              오행 인생 추천, 인생 이정표, 행운의 색깔까지<br />
              아이의 미래를 더 깊이 알아보세요
            </p>
            <button
              onClick={() => router.push('/naming')}
              className="w-full bg-white text-primary-700 py-3 rounded-2xl font-black hover:bg-primary-50 transition-colors"
            >
              🌟 사주 기반 이름 추천받기
            </button>
          </motion.div>
        )}

        {/* 직업 추천 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }} className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="font-bold text-gray-800 mb-1">💼 우리 아이에게 어울리는 직업</h2>
          <p className="text-xs text-gray-400 mb-4">십성(十星) · 오행 조합 · 일간 다차원 분석 기반 추천</p>
          <div className="space-y-3">
            {careerRecommendations.map((rec) => {
              const colors = ELEMENT_COLOR_CLASS[rec.element];
              return (
                <div key={rec.rank} className={`rounded-2xl p-4 ${colors.bg}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${colors.badge}`}>
                      {rec.rank}
                    </div>
                    <span className="font-bold text-gray-800 text-sm flex-1">{rec.career}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                      {ELEMENT_ICON[rec.element]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 bg-white/70 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rec.fitScore}%` }}
                        transition={{ duration: 0.7, delay: rec.rank * 0.1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${colors.bar}`}
                      />
                    </div>
                    <span className={`text-xs font-bold shrink-0 ${colors.text}`}>{rec.fitScore}점</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{rec.reason}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 카드 뽑기 CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
          className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 text-center"
        >
          <div className="text-3xl mb-2">🃏</div>
          <h3 className="text-white font-black text-lg mb-1">{name}의 운명 카드를 뽑아보세요</h3>
          <p className="text-white/60 text-sm mb-4">사주로 결정되는 {name}만의 특별한 운명 카드</p>
          <button
            onClick={() => router.push('/cards')}
            className="w-full bg-white text-purple-900 py-3 rounded-2xl font-black"
          >
            🎴 지금 바로 뽑기
          </button>
        </motion.div>

      </div>
    </div>
  );
}
