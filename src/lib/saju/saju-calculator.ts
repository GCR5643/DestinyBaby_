import type { SajuResult, SajuPillar, Element } from '@/types';
import { calculateSipsung } from '@/lib/saju/sipsung-calculator';

// 천간 (Heavenly Stems)
const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const HEAVENLY_STEMS_ELEMENT: Element[] = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];
const HEAVENLY_STEMS_YIN = [false, true, false, true, false, true, false, true, false, true];

// 지지 (Earthly Branches)
const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const EARTHLY_BRANCHES_ELEMENT: Element[] = ['water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water'];

export function calculateSaju(birthDate: string, birthTime?: string): SajuResult {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // Year Pillar calculation
  const yearStemIndex = ((year - 4) % 10 + 10) % 10;
  const yearBranchIndex = ((year - 4) % 12 + 12) % 12;

  // Month Pillar (simplified - based on month and year stem)
  const monthOffset = (yearStemIndex % 5) * 2;
  const monthStemIndex = ((month - 1 + monthOffset) % 10 + 10) % 10;
  const monthBranchIndex = ((month + 1) % 12 + 12) % 12;

  // Day Pillar (simplified calculation)
  const dayNumber = Math.floor(date.getTime() / 86400000) + 25567 + 1;
  const dayStemIndex = ((dayNumber % 10) + 10) % 10;
  const dayBranchIndex = ((dayNumber % 12) + 12) % 12;

  // 시간 미입력(null/undefined/"모름") 판별
  const hasTime = birthTime != null && birthTime !== '' && birthTime !== '모름';

  const yearPillar: SajuPillar = {
    heavenlyStem: HEAVENLY_STEMS[yearStemIndex],
    earthlyBranch: EARTHLY_BRANCHES[yearBranchIndex],
    element: HEAVENLY_STEMS_ELEMENT[yearStemIndex],
    yin_yang: HEAVENLY_STEMS_YIN[yearStemIndex] ? 'yin' : 'yang',
  };

  const monthPillar: SajuPillar = {
    heavenlyStem: HEAVENLY_STEMS[monthStemIndex],
    earthlyBranch: EARTHLY_BRANCHES[monthBranchIndex],
    element: HEAVENLY_STEMS_ELEMENT[monthStemIndex],
    yin_yang: HEAVENLY_STEMS_YIN[monthStemIndex] ? 'yin' : 'yang',
  };

  const dayPillar: SajuPillar = {
    heavenlyStem: HEAVENLY_STEMS[dayStemIndex],
    earthlyBranch: EARTHLY_BRANCHES[dayBranchIndex],
    element: HEAVENLY_STEMS_ELEMENT[dayStemIndex],
    yin_yang: HEAVENLY_STEMS_YIN[dayStemIndex] ? 'yin' : 'yang',
  };

  // Hour Pillar: 시간 미입력 시 null 처리
  let hourPillar: SajuPillar | null = null;
  let hourBranchIndex = 0;
  if (hasTime) {
    const [h] = birthTime!.split(':').map(Number);
    hourBranchIndex = Math.floor((h + 1) / 2) % 12;
    const hourStemIndex = ((dayStemIndex % 5) * 2 + hourBranchIndex) % 10;
    hourPillar = {
      heavenlyStem: HEAVENLY_STEMS[hourStemIndex],
      earthlyBranch: EARTHLY_BRANCHES[hourBranchIndex],
      element: HEAVENLY_STEMS_ELEMENT[hourStemIndex],
      yin_yang: HEAVENLY_STEMS_YIN[hourStemIndex] ? 'yin' : 'yang',
    };
  }

  // 오행 카운트: 시주가 없으면 년/월/일주만으로 분석
  const allElements: Element[] = [
    yearPillar.element, EARTHLY_BRANCHES_ELEMENT[yearBranchIndex],
    monthPillar.element, EARTHLY_BRANCHES_ELEMENT[monthBranchIndex],
    dayPillar.element, EARTHLY_BRANCHES_ELEMENT[dayBranchIndex],
  ];
  if (hourPillar !== null) {
    allElements.push(hourPillar.element, EARTHLY_BRANCHES_ELEMENT[hourBranchIndex]);
  }

  const elementCounts: Record<Element, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0,
  };
  allElements.forEach(e => elementCounts[e]++);

  const sortedElements = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);
  const mainElement = sortedElements[0][0] as Element;
  const lackingElement = sortedElements[4][0] as Element;
  const strongElements = sortedElements.slice(0, 2).map(e => e[0] as Element);
  const weakElements = sortedElements.slice(3).map(e => e[0] as Element);

  const partialResult: SajuResult = {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    mainElement,
    lackingElement,
    strongElements,
    weakElements,
    overallEnergy: Math.round(50 + (elementCounts[mainElement] - 2) * 10),
    birthDate,
    birthTime,
    hourPillarExcluded: !hasTime,
  };

  return {
    ...partialResult,
    sipsung: calculateSipsung(partialResult),
  };
}

export function getElementRelationship(element1: Element, element2: Element): 'generates' | 'controls' | 'neutral' {
  const generates: Record<Element, Element> = {
    wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood',
  };
  const controls: Record<Element, Element> = {
    wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood',
  };
  if (generates[element1] === element2) return 'generates';
  if (controls[element1] === element2) return 'controls';
  return 'neutral';
}
