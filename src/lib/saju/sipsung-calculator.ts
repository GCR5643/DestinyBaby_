import type { SajuResult, Sipsung, SipsungResult } from '@/types';

// 천간 오행
const STEM_ELEMENT: Record<string, string> = {
  갑: 'wood', 을: 'wood',
  병: 'fire', 정: 'fire',
  무: 'earth', 기: 'earth',
  경: 'metal', 신: 'metal',
  임: 'water', 계: 'water',
};

// 천간 음양 (true = 양, false = 음)
const STEM_YANG: Record<string, boolean> = {
  갑: true,  을: false,
  병: true,  정: false,
  무: true,  기: false,
  경: true,  신: false,
  임: true,  계: false,
};

// 지지 오행
const BRANCH_ELEMENT: Record<string, string> = {
  자: 'water', 축: 'earth', 인: 'wood',  묘: 'wood',
  진: 'earth', 사: 'fire',  오: 'fire',  미: 'earth',
  신: 'metal', 유: 'metal', 술: 'earth', 해: 'water',
};

// 지지 음양: 양지(자,인,진,오,신,술) / 음지(축,묘,사,미,유,해)
const BRANCH_YANG: Record<string, boolean> = {
  자: true,  축: false, 인: true,  묘: false,
  진: true,  사: false, 오: true,  미: false,
  신: true,  유: false, 술: true,  해: false,
};

// 상생 관계: A가 생하는 오행
const GENERATES: Record<string, string> = {
  wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood',
};

// 상극 관계: A가 극하는 오행
const CONTROLS: Record<string, string> = {
  wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood',
};

/**
 * 일간과 타 글자(천간/지지)의 관계에서 십성을 판별합니다.
 */
function deriveSipsung(
  dayElement: string,
  dayYang: boolean,
  targetElement: string,
  targetYang: boolean,
): Sipsung {
  const sameYinYang = dayYang === targetYang;

  if (dayElement === targetElement) {
    return sameYinYang ? '비견' : '겁재';
  }
  if (GENERATES[dayElement] === targetElement) {
    return sameYinYang ? '식신' : '상관';
  }
  if (CONTROLS[dayElement] === targetElement) {
    return sameYinYang ? '편재' : '정재';
  }
  if (CONTROLS[targetElement] === dayElement) {
    return sameYinYang ? '편관' : '정관';
  }
  if (GENERATES[targetElement] === dayElement) {
    return sameYinYang ? '편인' : '정인';
  }
  return '비견';
}

const SIPSUNG_INTERPRETATION: Record<Sipsung, string> = {
  비견: '독립심과 자주성이 강하며, 경쟁에서 두각을 나타냅니다.',
  겁재: '도전 정신과 개척 의지가 뛰어나며, 강한 추진력을 지닙니다.',
  식신: '창의적 표현 능력과 섬세한 감성이 풍부하며, 예술·교육 분야에서 빛납니다.',
  상관: '혁신적 사고와 파격적 아이디어로 기존 틀을 깨는 재능이 있습니다.',
  편재: '유동적 재물 운과 사업 수완이 있어 넓은 인맥과 활동력이 돋보입니다.',
  정재: '안정적이고 꼼꼼한 재물 관리 능력이 있어 신뢰받는 전문가로 성장합니다.',
  편관: '강한 리더십과 실행력으로 조직을 이끄는 권위를 가집니다.',
  정관: '원칙과 질서를 중시하며, 명예롭고 사회적으로 인정받는 길을 걷습니다.',
  편인: '비정통적 영감과 직관력이 뛰어나 독창적인 분야에서 성과를 냅니다.',
  정인: '학문과 지식 습득 능력이 탁월하여 전통적 전문직에서 두각을 나타냅니다.',
};

const ALL_SIPSUNG: Sipsung[] = [
  '비견', '겁재', '식신', '상관', '편재',
  '정재', '편관', '정관', '편인', '정인',
];

export function calculateSipsung(sajuResult: SajuResult): SipsungResult {
  const dayStem = sajuResult.dayPillar.heavenlyStem;
  const dayElement = STEM_ELEMENT[dayStem] ?? sajuResult.dayPillar.element;
  const dayYang = STEM_YANG[dayStem] ?? (sajuResult.dayPillar.yin_yang === 'yang');

  const distribution: Record<Sipsung, number> = {
    비견: 0, 겁재: 0, 식신: 0, 상관: 0, 편재: 0,
    정재: 0, 편관: 0, 정관: 0, 편인: 0, 정인: 0,
  };

  // 년간 십성
  const yearStem = sajuResult.yearPillar.heavenlyStem;
  const yearEl = STEM_ELEMENT[yearStem];
  const yearYang = STEM_YANG[yearStem];
  const yearSipsung: Sipsung = (yearEl !== undefined && yearYang !== undefined)
    ? deriveSipsung(dayElement, dayYang, yearEl, yearYang)
    : '비견';
  distribution[yearSipsung]++;

  // 월간 십성
  const monthStem = sajuResult.monthPillar.heavenlyStem;
  const monthEl = STEM_ELEMENT[monthStem];
  const monthYang = STEM_YANG[monthStem];
  const monthSipsung: Sipsung = (monthEl !== undefined && monthYang !== undefined)
    ? deriveSipsung(dayElement, dayYang, monthEl, monthYang)
    : '비견';
  distribution[monthSipsung]++;

  // 시간 십성 (시주 있을 때만)
  let hourSipsung: Sipsung | null = null;
  if (sajuResult.hourPillar) {
    const hourStem = sajuResult.hourPillar.heavenlyStem;
    const hourEl = STEM_ELEMENT[hourStem];
    const hourYang = STEM_YANG[hourStem];
    if (hourEl !== undefined && hourYang !== undefined) {
      hourSipsung = deriveSipsung(dayElement, dayYang, hourEl, hourYang);
      distribution[hourSipsung]++;
    }
  }

  // 지지 4개 (년지, 월지, 일지, 시지)
  const earthlyBranches: string[] = [
    sajuResult.yearPillar.earthlyBranch,
    sajuResult.monthPillar.earthlyBranch,
    sajuResult.dayPillar.earthlyBranch,
  ];
  if (sajuResult.hourPillar) {
    earthlyBranches.push(sajuResult.hourPillar.earthlyBranch);
  }

  for (const branch of earthlyBranches) {
    const el = BRANCH_ELEMENT[branch];
    const yang = BRANCH_YANG[branch];
    if (el !== undefined && yang !== undefined) {
      const ss = deriveSipsung(dayElement, dayYang, el, yang);
      distribution[ss]++;
    }
  }

  // 내림차순 정렬 후 최다 십성 추출 (동점이면 복수)
  const sorted = ALL_SIPSUNG.slice().sort((a, b) => distribution[b] - distribution[a]);
  const maxCount = distribution[sorted[0] ?? '비견'];
  const dominant: Sipsung[] = sorted.filter(s => distribution[s] === maxCount && maxCount > 0);
  if (dominant.length === 0) dominant.push('비견');

  const topDominant = dominant[0] ?? '비견';
  const secondDominant = sorted.find(s => !dominant.includes(s)) ?? sorted[1] ?? '겁재';

  const interpretation = `우리 아이의 ${topDominant}이 가장 강합니다. ${SIPSUNG_INTERPRETATION[topDominant]} 또한 ${secondDominant}의 기운도 뒷받침하여 다양한 분야에서 재능을 펼칠 수 있습니다.`;

  return { dominant, distribution, yearSipsung, monthSipsung, hourSipsung, interpretation };
}
