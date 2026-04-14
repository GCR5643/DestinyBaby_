import type { SajuResult, Element, ParentChildCompatibilityResult } from '@/types';
import { getElementRelationship } from './saju-calculator';

// ── 천간 (Heavenly Stems) 참조 테이블 ──

const STEM_ELEMENT: Record<string, Element> = {
  '갑': 'wood', '을': 'wood',
  '병': 'fire', '정': 'fire',
  '무': 'earth', '기': 'earth',
  '경': 'metal', '신': 'metal',
  '임': 'water', '계': 'water',
};

// 천간합 쌍 (甲己合, 乙庚合, 丙辛合, 丁壬合, 戊癸合)
const HEAVENLY_STEM_COMBINATIONS: [string, string][] = [
  ['갑', '기'], // 甲己合 -> 토
  ['을', '경'], // 乙庚合 -> 금
  ['병', '신'], // 丙辛合 -> 수
  ['정', '임'], // 丁壬合 -> 목
  ['무', '계'], // 戊癸合 -> 화
];

// ── 지지 (Earthly Branches) 참조 테이블 ──

const BRANCH_ELEMENT: Record<string, Element> = {
  '자': 'water', '축': 'earth', '인': 'wood', '묘': 'wood',
  '진': 'earth', '사': 'fire', '오': 'fire', '미': 'earth',
  '신': 'metal', '유': 'metal', '술': 'earth', '해': 'water',
};

// 지지 육합 (六合)
const EARTHLY_BRANCH_SIX_HARMONIES: [string, string][] = [
  ['자', '축'], // 子丑合
  ['인', '해'], // 寅亥合
  ['묘', '술'], // 卯戌合
  ['진', '유'], // 辰酉合
  ['사', '신'], // 巳申合
  ['오', '미'], // 午未合
];

// 지지 삼합 (三合)
const EARTHLY_BRANCH_THREE_HARMONIES: [string, string, string][] = [
  ['인', '오', '술'], // 寅午戌 -> 화국
  ['사', '유', '축'], // 巳酉丑 -> 금국
  ['신', '자', '진'], // 申子辰 -> 수국
  ['해', '묘', '미'], // 亥卯未 -> 목국
];

// 지지 충 (六衝)
const EARTHLY_BRANCH_CLASHES: [string, string][] = [
  ['자', '오'], // 子午衝
  ['축', '미'], // 丑未衝
  ['인', '신'], // 寅申衝
  ['묘', '유'], // 卯酉衝
  ['진', '술'], // 辰戌衝
  ['사', '해'], // 巳亥衝
];

// 지지 형 (三刑)
const EARTHLY_BRANCH_PUNISHMENTS: [string, string][] = [
  ['인', '사'], // 寅巳刑
  ['사', '신'], // 巳申刑 (무은지형)
  ['축', '술'], // 丑戌刑
  ['술', '미'], // 戌未刑
  ['미', '축'], // 未丑刑 (무례지형)
  ['자', '묘'], // 子卯刑 (무례지형)
];

// 오행 상생 관계: A -> B (A가 B를 생함)
const GENERATES: Record<Element, Element> = {
  wood: 'fire',  // 목생화
  fire: 'earth', // 화생토
  earth: 'metal', // 토생금
  metal: 'water', // 금생수
  water: 'wood',  // 수생목
};

// 오행 상극 관계: A -> B (A가 B를 극함)
const CONTROLS: Record<Element, Element> = {
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood',
};

// ── 헬퍼 함수 ──

/** 두 천간이 천간합인지 확인 */
function isStemCombination(stem1: string, stem2: string): boolean {
  return HEAVENLY_STEM_COMBINATIONS.some(
    ([a, b]) => (stem1 === a && stem2 === b) || (stem1 === b && stem2 === a)
  );
}

/** 두 지지가 육합인지 확인 */
function isSixHarmony(branch1: string, branch2: string): boolean {
  return EARTHLY_BRANCH_SIX_HARMONIES.some(
    ([a, b]) => (branch1 === a && branch2 === b) || (branch1 === b && branch2 === a)
  );
}

/** 두 지지가 삼합의 일부인지 확인 (같은 삼합국에 속하는지) */
function isPartOfThreeHarmony(branch1: string, branch2: string): boolean {
  return EARTHLY_BRANCH_THREE_HARMONIES.some(
    trio => trio.includes(branch1) && trio.includes(branch2) && branch1 !== branch2
  );
}

/** 두 지지가 충인지 확인 */
function isClash(branch1: string, branch2: string): boolean {
  return EARTHLY_BRANCH_CLASHES.some(
    ([a, b]) => (branch1 === a && branch2 === b) || (branch1 === b && branch2 === a)
  );
}

/** 두 지지가 형인지 확인 */
function isPunishment(branch1: string, branch2: string): boolean {
  return EARTHLY_BRANCH_PUNISHMENTS.some(
    ([a, b]) => (branch1 === a && branch2 === b) || (branch1 === b && branch2 === a)
  );
}

/** 사주에서 모든 지지 추출 */
function getAllBranches(saju: SajuResult): string[] {
  const branches = [
    saju.yearPillar.earthlyBranch,
    saju.monthPillar.earthlyBranch,
    saju.dayPillar.earthlyBranch,
  ];
  if (saju.hourPillar) {
    branches.push(saju.hourPillar.earthlyBranch);
  }
  return branches;
}

/** 사주에서 모든 천간 추출 */
function getAllStems(saju: SajuResult): string[] {
  const stems = [
    saju.yearPillar.heavenlyStem,
    saju.monthPillar.heavenlyStem,
    saju.dayPillar.heavenlyStem,
  ];
  if (saju.hourPillar) {
    stems.push(saju.hourPillar.heavenlyStem);
  }
  return stems;
}

/** 오행 카운트 계산 */
function countElements(saju: SajuResult): Record<Element, number> {
  const counts: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const stems = getAllStems(saju);
  const branches = getAllBranches(saju);
  for (const s of stems) {
    if (STEM_ELEMENT[s]) counts[STEM_ELEMENT[s]]++;
  }
  for (const b of branches) {
    if (BRANCH_ELEMENT[b]) counts[BRANCH_ELEMENT[b]]++;
  }
  return counts;
}

const ELEMENT_NAME_KR: Record<Element, string> = {
  wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
};

// ── 분석 함수들 ──

/** 1. 오행 보완관계 분석 */
function analyzeElementBalance(parentSaju: SajuResult, childSaju: SajuResult): { score: number; description: string } {
  const parentCounts = countElements(parentSaju);
  const childCounts = countElements(childSaju);

  let complementScore = 0;
  let descriptions: string[] = [];

  // 부모에게 부족한 오행을 자녀가 보완하는지 확인
  for (const el of parentSaju.weakElements) {
    if (childCounts[el] >= 2) {
      complementScore += 25;
      descriptions.push(`아이의 ${ELEMENT_NAME_KR[el]} 기운이 부모의 부족한 부분을 채워줍니다`);
    } else if (childCounts[el] >= 1) {
      complementScore += 15;
    }
  }

  // 자녀에게 부족한 오행을 부모가 보완하는지 확인
  for (const el of childSaju.weakElements) {
    if (parentCounts[el] >= 2) {
      complementScore += 15;
      descriptions.push(`부모의 ${ELEMENT_NAME_KR[el]} 기운이 아이에게 좋은 영향을 줍니다`);
    } else if (parentCounts[el] >= 1) {
      complementScore += 10;
    }
  }

  // 주요 오행이 같으면 공감 보너스
  if (parentSaju.mainElement === childSaju.mainElement) {
    complementScore += 10;
    descriptions.push(`같은 ${ELEMENT_NAME_KR[parentSaju.mainElement]} 기운으로 자연스러운 공감대를 형성합니다`);
  }

  const score = Math.min(100, Math.max(40, complementScore + 40));
  const description = descriptions.length > 0
    ? descriptions.join('. ')
    : '서로 다른 오행 에너지를 가지고 있어 다양한 경험을 나눌 수 있습니다';

  return { score, description };
}

/** 2. 천간합 분석 */
function analyzeHeavenlyStemHarmony(parentSaju: SajuResult, childSaju: SajuResult): { score: number; description: string } {
  const parentDayStem = parentSaju.dayPillar.heavenlyStem;
  const childDayStem = childSaju.dayPillar.heavenlyStem;

  // 일간끼리 천간합 확인
  const dayHarmony = isStemCombination(parentDayStem, childDayStem);

  // 모든 천간 조합 확인
  const parentStems = getAllStems(parentSaju);
  const childStems = getAllStems(childSaju);
  let harmonyCounts = 0;
  for (const ps of parentStems) {
    for (const cs of childStems) {
      if (isStemCombination(ps, cs)) harmonyCounts++;
    }
  }

  if (dayHarmony) {
    return {
      score: 95,
      description: `부모의 일간 ${parentDayStem}과 아이의 일간 ${childDayStem}이 천간합을 이루어 깊은 유대감이 형성됩니다`,
    };
  }

  if (harmonyCounts >= 2) {
    return {
      score: 85,
      description: `${harmonyCounts}개의 천간합이 있어 서로 자연스럽게 통하는 부분이 많습니다`,
    };
  }

  if (harmonyCounts === 1) {
    return {
      score: 70,
      description: '천간합이 있어 서로 마음이 통하는 부분이 있습니다',
    };
  }

  // 천간합이 없어도 상생 관계 확인
  const parentDayEl = STEM_ELEMENT[parentDayStem];
  const childDayEl = STEM_ELEMENT[childDayStem];
  if (parentDayEl && childDayEl && GENERATES[parentDayEl] === childDayEl) {
    return {
      score: 65,
      description: `부모의 ${ELEMENT_NAME_KR[parentDayEl]} 기운이 아이의 ${ELEMENT_NAME_KR[childDayEl]} 기운을 자연스럽게 키워줍니다`,
    };
  }

  return {
    score: 55,
    description: '천간의 직접적인 합은 없지만 서로 다른 장점을 배울 수 있는 관계입니다',
  };
}

/** 3. 지지 합 분석 (삼합/육합) */
function analyzeEarthlyBranchHarmony(parentSaju: SajuResult, childSaju: SajuResult): { score: number; description: string } {
  const parentBranches = getAllBranches(parentSaju);
  const childBranches = getAllBranches(childSaju);

  let sixHarmonies = 0;
  let threeHarmonies = 0;

  for (const pb of parentBranches) {
    for (const cb of childBranches) {
      if (isSixHarmony(pb, cb)) sixHarmonies++;
      if (isPartOfThreeHarmony(pb, cb)) threeHarmonies++;
    }
  }

  const descriptions: string[] = [];

  if (sixHarmonies > 0) {
    descriptions.push(`${sixHarmonies}개의 육합이 있어 서로 끌리는 자연스러운 인연입니다`);
  }
  if (threeHarmonies > 0) {
    descriptions.push(`삼합 관계가 있어 함께할 때 더 큰 시너지를 발휘합니다`);
  }

  const score = Math.min(100, 50 + sixHarmonies * 15 + threeHarmonies * 10);
  const description = descriptions.length > 0
    ? descriptions.join('. ')
    : '지지 합은 없지만 서로의 존재가 안정감을 줄 수 있는 관계입니다';

  return { score, description };
}

/** 4. 충/형 분석 */
function analyzeConflicts(parentSaju: SajuResult, childSaju: SajuResult): { score: number; description: string } {
  const parentBranches = getAllBranches(parentSaju);
  const childBranches = getAllBranches(childSaju);

  let clashCount = 0;
  let punishmentCount = 0;

  for (const pb of parentBranches) {
    for (const cb of childBranches) {
      if (isClash(pb, cb)) clashCount++;
      if (isPunishment(pb, cb)) punishmentCount++;
    }
  }

  // 충/형이 없으면 높은 점수
  if (clashCount === 0 && punishmentCount === 0) {
    return {
      score: 95,
      description: '충이나 형이 없어 평화롭고 조화로운 관계가 기대됩니다',
    };
  }

  const descriptions: string[] = [];

  if (clashCount > 0) {
    descriptions.push(
      clashCount === 1
        ? '약간의 충이 있어 때때로 의견 차이가 있을 수 있지만, 이는 서로를 더 깊이 이해하는 계기가 됩니다'
        : '충이 여러 곳에 있어 서로 다른 성향이 뚜렷하지만, 오히려 다양한 관점을 배울 수 있습니다'
    );
  }

  if (punishmentCount > 0) {
    descriptions.push('형의 관계가 있어 서로 자극을 주고받으며 함께 성장하는 관계입니다');
  }

  // 부정적이지 않게 점수 조절 (최소 45)
  const score = Math.max(45, 95 - clashCount * 15 - punishmentCount * 10);
  return { score, description: descriptions.join('. ') };
}

/** 5. 일간 상생 분석 */
function analyzeGenerativeRelation(parentSaju: SajuResult, childSaju: SajuResult): { score: number; description: string } {
  const parentDayEl = parentSaju.dayPillar.element;
  const childDayEl = childSaju.dayPillar.element;

  // 부모 -> 자녀 상생 (가장 이상적)
  if (GENERATES[parentDayEl] === childDayEl) {
    return {
      score: 95,
      description: `부모의 ${ELEMENT_NAME_KR[parentDayEl]} 기운이 아이의 ${ELEMENT_NAME_KR[childDayEl]} 기운을 자연스럽게 키워줍니다. 가장 이상적인 상생 관계입니다`,
    };
  }

  // 자녀 -> 부모 상생 (자녀가 부모에게 힘을 줌)
  if (GENERATES[childDayEl] === parentDayEl) {
    return {
      score: 85,
      description: `아이의 ${ELEMENT_NAME_KR[childDayEl]} 기운이 부모의 ${ELEMENT_NAME_KR[parentDayEl]} 기운에 활력을 줍니다. 서로에게 좋은 영향을 주는 관계입니다`,
    };
  }

  // 같은 오행
  if (parentDayEl === childDayEl) {
    return {
      score: 75,
      description: `같은 ${ELEMENT_NAME_KR[parentDayEl]} 기운으로 서로를 잘 이해하고 공감하는 관계입니다`,
    };
  }

  // 상극 관계 (부정적이지 않게)
  if (CONTROLS[parentDayEl] === childDayEl) {
    return {
      score: 55,
      description: `부모의 ${ELEMENT_NAME_KR[parentDayEl]} 기운이 아이의 ${ELEMENT_NAME_KR[childDayEl]} 기운을 다듬어주는 관계입니다. 적절한 훈육과 격려로 아이가 단단하게 성장합니다`,
    };
  }

  if (CONTROLS[childDayEl] === parentDayEl) {
    return {
      score: 60,
      description: `아이가 부모에게 새로운 자극과 성장의 기회를 줍니다. 서로 배우며 함께 발전하는 관계입니다`,
    };
  }

  return {
    score: 65,
    description: '서로 독립적인 오행 관계로, 각자의 개성을 존중하며 함께할 수 있습니다',
  };
}

// ── 조언 생성 ──

function generateAdvice(
  parentSaju: SajuResult,
  childSaju: SajuResult,
  scores: { elementBalance: number; conflicts: number; generative: number },
): string[] {
  const advice: string[] = [];

  // 오행 보완 조언
  const childLacking = childSaju.lackingElement;
  const elementAdvice: Record<Element, string> = {
    wood: '나무와 자연 속 활동, 독서와 창작 활동이 아이에게 도움이 됩니다',
    fire: '따뜻한 격려와 표현의 기회를 많이 주세요. 예술이나 운동 활동이 좋습니다',
    earth: '규칙적인 생활과 안정된 환경을 만들어주세요. 요리나 공예 활동을 추천합니다',
    metal: '체계적인 학습과 단계적 목표 설정이 도움됩니다. 음악이나 수학이 잘 맞습니다',
    water: '유연한 사고를 키워주세요. 수영이나 여행 등 물과 관련된 활동이 좋습니다',
  };
  advice.push(elementAdvice[childLacking]);

  // 상생 관계 조언
  if (scores.generative >= 85) {
    advice.push('자연스러운 교감이 잘 이루어지는 관계이니, 함께하는 시간을 충분히 가져보세요');
  } else if (scores.generative <= 60) {
    advice.push('서로 다른 성향을 이해하는 노력이 필요합니다. 대화와 경청의 시간을 꾸준히 가져보세요');
  }

  // 충돌 관계 조언
  if (scores.conflicts <= 70) {
    advice.push('의견 차이가 있을 때는 감정보다 이유를 먼저 물어보세요. 서로의 관점을 존중하는 것이 중요합니다');
  }

  // 오행 균형 조언
  if (scores.elementBalance <= 60) {
    advice.push('서로 부족한 오행이 비슷하니, 함께 부족한 기운을 보충할 수 있는 활동을 찾아보세요');
  }

  // 공통 조언
  advice.push('아이의 타고난 기질을 인정하고 장점을 살려주는 양육이 가장 효과적입니다');

  return advice;
}

// ── 총평 생성 ──

function generateSummary(overallScore: number, parentRole: 'father' | 'mother'): string {
  const roleKr = parentRole === 'father' ? '아버지' : '어머니';

  if (overallScore >= 85) {
    return `${roleKr}와 아이가 천생의 인연으로 이어진 아름다운 궁합입니다. 서로에게 큰 행복과 성장을 줄 것입니다.`;
  }
  if (overallScore >= 70) {
    return `${roleKr}와 아이가 조화로운 관계를 이루는 좋은 궁합입니다. 함께하는 시간이 서로에게 긍정적인 영향을 줍니다.`;
  }
  if (overallScore >= 55) {
    return `${roleKr}와 아이가 서로 배우며 성장하는 관계입니다. 약간의 노력으로 더욱 깊은 유대를 만들 수 있습니다.`;
  }
  return `${roleKr}와 아이가 서로 다른 매력을 가진 관계입니다. 차이를 이해하고 존중하면 오히려 더 단단한 관계가 됩니다.`;
}

// ── 메인 분석 함수 ──

export function analyzeParentChildCompatibility(
  parentSaju: SajuResult,
  childSaju: SajuResult,
  parentRole: 'father' | 'mother',
): ParentChildCompatibilityResult {
  const elementBalance = analyzeElementBalance(parentSaju, childSaju);
  const heavenlyStemHarmony = analyzeHeavenlyStemHarmony(parentSaju, childSaju);
  const earthlyBranchHarmony = analyzeEarthlyBranchHarmony(parentSaju, childSaju);
  const conflictAnalysis = analyzeConflicts(parentSaju, childSaju);
  const generativeRelation = analyzeGenerativeRelation(parentSaju, childSaju);

  // 가중치 기반 종합 점수
  const overallScore = Math.round(
    elementBalance.score * 0.20 +
    heavenlyStemHarmony.score * 0.25 +
    earthlyBranchHarmony.score * 0.15 +
    conflictAnalysis.score * 0.20 +
    generativeRelation.score * 0.20
  );

  const advice = generateAdvice(parentSaju, childSaju, {
    elementBalance: elementBalance.score,
    conflicts: conflictAnalysis.score,
    generative: generativeRelation.score,
  });

  const summary = generateSummary(overallScore, parentRole);

  return {
    overallScore,
    summary,
    details: {
      elementBalance,
      heavenlyStemHarmony,
      earthlyBranchHarmony,
      conflictAnalysis,
      generativeRelation,
    },
    advice,
    parentRole,
  };
}

// 기존 호환용 re-export
export { analyzeParentChildCompatibility as analyzeCompatibilityV2 };

// 기존 간단한 궁합 분석 (기존 코드 호환)
export interface CompatibilityResult {
  score: number;
  level: 'excellent' | 'good' | 'average' | 'poor';
  aspects: { title: string; score: number; comment: string }[];
  overallComment: string;
}

export function analyzeCompatibility(saju1: SajuResult, saju2: SajuResult): CompatibilityResult {
  let score = 0;
  const aspects = [];

  const elemRelation = getElementRelationship(saju1.mainElement, saju2.mainElement);
  const elemScore = elemRelation === 'generates' ? 90 : elemRelation === 'neutral' ? 70 : 50;
  score += elemScore * 0.4;
  aspects.push({
    title: '오행 궁합',
    score: elemScore,
    comment: elemRelation === 'generates'
      ? '서로의 기운이 잘 맞아 조화를 이룹니다'
      : elemRelation === 'neutral'
      ? '서로 무난한 관계입니다'
      : '서로 보완이 필요한 관계입니다',
  });

  const yearScore = saju1.yearPillar.yin_yang !== saju2.yearPillar.yin_yang ? 85 : 65;
  score += yearScore * 0.3;
  aspects.push({
    title: '연주 궁합',
    score: yearScore,
    comment: yearScore > 80 ? '음양이 조화롭습니다' : '비슷한 기질을 가지고 있습니다',
  });

  const energyDiff = Math.abs(saju1.overallEnergy - saju2.overallEnergy);
  const energyScore = Math.max(60, 100 - energyDiff * 2);
  score += energyScore * 0.3;
  aspects.push({
    title: '기운 균형',
    score: energyScore,
    comment: energyDiff < 10 ? '비슷한 에너지를 가지고 있습니다' : '서로 다른 에너지가 보완됩니다',
  });

  const totalScore = Math.round(score);
  const level = totalScore >= 85 ? 'excellent' : totalScore >= 70 ? 'good' : totalScore >= 55 ? 'average' : 'poor';

  return {
    score: totalScore,
    level,
    aspects,
    overallComment: level === 'excellent'
      ? '천생연분입니다! 서로를 더욱 빛나게 해주는 최고의 궁합이에요.'
      : level === 'good'
      ? '좋은 궁합이에요. 서로 이해하고 배려하면 행복한 관계가 될 수 있어요.'
      : level === 'average'
      ? '노력이 필요하지만 충분히 좋은 관계를 만들 수 있어요.'
      : '서로의 차이를 이해하고 소통한다면 더 성장할 수 있는 관계에요.',
  };
}
