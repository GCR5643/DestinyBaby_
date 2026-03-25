import type { SajuResult, Grade, Element } from '@/types';

export interface SajuCardBoost {
  elementBoosts: Record<Element, number>;
  gradeBoosts: Record<Grade, number>;
  reason: string;
}

// 상생 관계: key 오행이 value 오행을 생함
const GENERATES: Record<Element, Element> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
};

const ALL_ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
const ALL_GRADES: Grade[] = ['N', 'R', 'SR', 'SSR', 'UR', 'SSS'];

export function calculateSajuBoost(saju: SajuResult): SajuCardBoost {
  const boosts: Record<Element, number> = {
    wood: 1.0,
    fire: 1.0,
    earth: 1.0,
    metal: 1.0,
    water: 1.0,
  };

  const reasons: string[] = [];

  // 일간 오행 → +20%
  const dayElement = saju.dayPillar.element;
  boosts[dayElement] += 0.20;
  reasons.push(`일간 ${saju.dayPillar.heavenlyStem}(${dayElement})+20%`);

  // 가장 강한 오행 → +15% (일간과 다를 때만 추가)
  const strongestElement = saju.strongElements[0];
  if (strongestElement !== dayElement) {
    boosts[strongestElement] += 0.15;
    reasons.push(`최강 오행 ${strongestElement}+15%`);
  } else if (saju.strongElements[1]) {
    // 2번째 강한 오행에 적용
    boosts[saju.strongElements[1]] += 0.15;
    reasons.push(`2강 오행 ${saju.strongElements[1]}+15%`);
  }

  // 부족한 오행 → +10% (보완 카드)
  const lackingElement = saju.lackingElement;
  boosts[lackingElement] += 0.10;
  reasons.push(`부족 오행 ${lackingElement}+10%(보완)`);

  // 상생 오행 → +5%
  const generatedByDay = GENERATES[dayElement];
  if (generatedByDay !== lackingElement && generatedByDay !== strongestElement) {
    boosts[generatedByDay] += 0.05;
    reasons.push(`상생 ${dayElement}→${generatedByDay}+5%`);
  }

  // 등급 가중치는 기본 1.0 (등급 확률은 기존 weightedPull에서 처리)
  const gradeBoosts: Record<Grade, number> = {} as Record<Grade, number>;
  ALL_GRADES.forEach(g => { gradeBoosts[g] = 1.0; });

  return {
    elementBoosts: boosts,
    gradeBoosts,
    reason: reasons.join(', '),
  };
}

export function weightedElementPick(boosts: Record<Element, number>): Element {
  const weights = ALL_ELEMENTS.map(e => boosts[e] ?? 1.0);
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  for (let i = 0; i < ALL_ELEMENTS.length; i++) {
    random -= weights[i];
    if (random <= 0) return ALL_ELEMENTS[i];
  }
  return ALL_ELEMENTS[0];
}

// 기존 호환 — 등급 확률 조정 (card-matcher 원래 목적)
const ELEMENT_GRADE_BOOST: Record<Element, Grade[]> = {
  wood: ['SR', 'SSR', 'UR'],
  fire: ['SSR', 'UR', 'SSS'],
  earth: ['R', 'SR', 'SSR'],
  metal: ['SSR', 'UR', 'SSS'],
  water: ['SR', 'SSR', 'UR'],
};

export function calculateCardProbability(
  saju: SajuResult,
  baseProbabilities: Record<Grade, number>
): Record<Grade, number> {
  const boostedGrades = ELEMENT_GRADE_BOOST[saju.mainElement] || [];
  const modified = { ...baseProbabilities };

  boostedGrades.forEach(grade => {
    modified[grade] = (modified[grade] || 0) * 1.2;
  });

  const total = Object.values(modified).reduce((a, b) => a + b, 0);
  Object.keys(modified).forEach(k => {
    modified[k as Grade] = modified[k as Grade] / total;
  });

  return modified;
}

export function selectCardGrade(probabilities: Record<Grade, number>, pityCount = 0): Grade {
  const grades: Grade[] = ['N', 'R', 'SR', 'SSR', 'UR', 'SSS'];

  if (pityCount >= 90) return 'SSS';
  if (pityCount >= 50) return 'UR';

  const random = Math.random();
  let cumulative = 0;

  for (const grade of grades) {
    cumulative += probabilities[grade] || 0;
    if (random <= cumulative) return grade;
  }

  return 'N';
}
