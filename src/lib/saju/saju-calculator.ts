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
  const rawLackingElement = sortedElements[4][0] as Element;
  const strongElements = sortedElements.slice(0, 2).map(e => e[0] as Element);
  const weakElements = sortedElements.slice(3).map(e => e[0] as Element);

  // ──── 용신(用神) 고도화: 조후(調候) + 억부(抑扶) 분석 ────
  // 출처: 전문 작명사 공통 기준 (sajuforum.com, agiirum.com)
  // 조후: 계절(월지)에 따른 온도/습도 균형 → 필요 오행 결정
  // 억부: 일간 강약 판단 → 강하면 설기(洩氣)/극(剋), 약하면 생(生)/비(比)
  const dayMasterElement = dayPillar.element;
  const monthBranchElement = EARTHLY_BRANCHES_ELEMENT[monthBranchIndex];

  // 조후 분석: 월지(계절)에 따른 보완 오행
  const johuElement = calculateJohu(dayMasterElement, monthBranchIndex);

  // 억부 분석: 일간 강약 판단
  const dayMasterStrength = calculateDayMasterStrength(
    dayMasterElement, elementCounts, monthBranchElement
  );

  // 용신 결정: 조후 우선, 억부 보조
  const lackingElement = determineYongshin(
    rawLackingElement, johuElement, dayMasterElement, dayMasterStrength, elementCounts
  );

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

/**
 * 조후(調候) 분석: 월지(계절)별 일간에 필요한 오행 판단
 * 출처: 삼명통회(三命通會), 궁통보감(窮通寶鑑) 원리
 *
 * 여름(사/오/미) → 더위를 식히는 水/金 필요
 * 겨울(해/자/축) → 추위를 데우는 火/木 필요
 * 봄/가을 → 일간 강약 기반 억부 분석 우선
 */
function calculateJohu(dayMaster: Element, monthBranchIdx: number): Element | null {
  // 월지 → 계절 매핑 (인묘진=봄, 사오미=여름, 신유술=가을, 해자축=겨울)
  const season: 'spring' | 'summer' | 'autumn' | 'winter' =
    [2, 3, 4].includes(monthBranchIdx) ? 'spring' :
    [5, 6, 7].includes(monthBranchIdx) ? 'summer' :
    [8, 9, 10].includes(monthBranchIdx) ? 'autumn' : 'winter';

  // 조후 테이블: [일간 오행][계절] → 필요 오행
  const JOHU_TABLE: Record<Element, Partial<Record<typeof season, Element>>> = {
    wood: { summer: 'water', winter: 'fire' },
    fire: { summer: 'water', winter: 'wood', autumn: 'wood' },
    earth: { summer: 'water', winter: 'fire', spring: 'fire' },
    metal: { summer: 'water', winter: 'fire', spring: 'earth' },
    water: { summer: 'metal', winter: 'fire', spring: 'wood' },
  };

  return JOHU_TABLE[dayMaster]?.[season] ?? null;
}

/**
 * 억부(抑扶) 분석: 일간 강약 판단
 * 일간과 같은 오행(비겁) + 일간을 생하는 오행(인성)이 많으면 신강
 * 일간을 극/설하는 오행이 많으면 신약
 * @returns 'strong' | 'weak' | 'balanced'
 */
function calculateDayMasterStrength(
  dayMaster: Element,
  counts: Record<Element, number>,
  monthBranchElement: Element,
): 'strong' | 'weak' | 'balanced' {
  const GENERATES: Record<Element, Element> = {
    water: 'wood', wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water',
  };
  // 일간을 생하는 오행 (인성)
  const generatesMe = Object.entries(GENERATES).find(([, v]) => v === dayMaster)?.[0] as Element;

  // 신강 점수: 비겁(같은 오행) + 인성(나를 생하는 오행)
  const supportScore = counts[dayMaster] + (generatesMe ? counts[generatesMe] : 0);
  // 월지가 일간을 돕는가 (득령)
  const deukryeong = monthBranchElement === dayMaster || monthBranchElement === generatesMe;

  const totalElements = Object.values(counts).reduce((a, b) => a + b, 0);
  const supportRatio = supportScore / totalElements;

  if (supportRatio > 0.5 || (supportRatio >= 0.4 && deukryeong)) return 'strong';
  if (supportRatio < 0.3 || (supportRatio <= 0.35 && !deukryeong)) return 'weak';
  return 'balanced';
}

/**
 * 용신(用神) 최종 결정
 * 우선순위: 조후 > 억부 > 단순 부족
 */
function determineYongshin(
  rawLacking: Element,
  johu: Element | null,
  dayMaster: Element,
  strength: 'strong' | 'weak' | 'balanced',
  counts: Record<Element, number>,
): Element {
  const GENERATES: Record<Element, Element> = {
    water: 'wood', wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water',
  };
  const CONTROLS: Record<Element, Element> = {
    wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood',
  };

  // 1) 조후가 있고, 해당 오행이 실제로 부족하면 조후 우선
  if (johu && counts[johu] <= 1) {
    return johu;
  }

  // 2) 억부 기반 판단
  if (strength === 'strong') {
    // 신강: 설기(나를 설하는 오행=식상) 또는 극(나를 극하는 오행=관성)
    const exhaust = GENERATES[dayMaster]; // 내가 생하는 오행 = 설기
    const control = Object.entries(CONTROLS).find(([, v]) => v === dayMaster)?.[0] as Element | undefined;
    // 설기가 부족하면 설기, 아니면 극
    if (counts[exhaust] <= 1) return exhaust;
    if (control && counts[control] <= 1) return control;
  } else if (strength === 'weak') {
    // 신약: 인성(나를 생하는 오행) 또는 비겁(같은 오행)
    const generatesMe = Object.entries(GENERATES).find(([, v]) => v === dayMaster)?.[0] as Element | undefined;
    if (generatesMe && counts[generatesMe] <= 1) return generatesMe;
    if (counts[dayMaster] <= 1) return dayMaster;
  }

  // 3) 조후가 있으면 조후 반환
  if (johu) return johu;

  // 4) 기본: 단순 부족 오행
  return rawLacking;
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
