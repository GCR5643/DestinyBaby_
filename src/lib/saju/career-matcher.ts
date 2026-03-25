import type { SajuResult, Element, Sipsung } from '@/types';

export interface CareerRecommendation {
  rank: number;
  career: string;
  element: Element;
  fitScore: number;
  reason: string;
}

// 오행별 직업 목록 (각 6개)
const ELEMENT_CAREERS: Record<Element, string[]> = {
  wood:  ['교육자/교수', '작가/소설가', '건축가', '환경운동가', '의사/한의사', '상담사/심리치료사'],
  fire:  ['예술가/화가', '연예인/배우', '마케터/광고인', '요리사/셰프', '디자이너', '미디어 크리에이터/유튜버'],
  earth: ['공무원/행정가', '부동산 전문가', '농업/식품산업', '회계사/세무사', '인사/HR 전문가', '사회복지사'],
  metal: ['법조인/변호사', '엔지니어/기술자', '금융/투자전문가', '외과의사/치과의사', '군인/경찰', '보석/귀금속 전문가'],
  water: ['IT/프로그래머', '외교관/통역사', '무역/글로벌비즈니스', '저널리스트/기자', '철학자/연구원', '항해사/물류전문가'],
};

// 오행 한국어 이름
const ELEMENT_KO: Record<Element, string> = {
  wood:  '木(목)',
  fire:  '火(화)',
  earth: '土(토)',
  metal: '金(금)',
  water: '水(수)',
};

// 오행 아이콘
const ELEMENT_ICON: Record<Element, string> = {
  wood:  '🌿',
  fire:  '🔥',
  earth: '🌍',
  metal: '⚡',
  water: '💧',
};

export { ELEMENT_ICON };

// 십성별 직업 성향 매핑
const SIPSUNG_CAREER_TRAITS: Record<Sipsung, { trait: string; careers: string[] }> = {
  비견: { trait: '독립/경쟁', careers: ['창업가', '프리랜서', '운동선수', '자영업자'] },
  겁재: { trait: '도전/개척', careers: ['영업전문가', '투자자', '탐험가', '스타트업 대표'] },
  식신: { trait: '표현/창작', careers: ['셰프', '작가', '교사', '공예가'] },
  상관: { trait: '혁신/파격', careers: ['발명가', '연예인', '크리에이터', 'PD'] },
  편재: { trait: '유동재물/사업', careers: ['무역상', '자산관리사', '이벤트기획자', '부동산개발'] },
  정재: { trait: '안정재물/관리', careers: ['금융인', '회계사', '공무원', '은행원'] },
  편관: { trait: '권위/실행력', careers: ['군인', '경찰', '외과의사', '소방관'] },
  정관: { trait: '질서/명예', careers: ['법조인', 'CEO', '정치인', '외교관'] },
  편인: { trait: '비정통/영감', careers: ['연구원', '철학자', '점술가', '대체의학전문가'] },
  정인: { trait: '정통학문/지식', careers: ['교수', '의사', '학자', '컨설턴트'] },
};

// 오행 조합별 특수 직업
const ELEMENT_COMBO_CAREERS: Record<string, { combo: string; careers: string[] }> = {
  '木+火': { combo: '창조+표현', careers: ['콘텐츠 크리에이터', '건축디자이너', '브랜드디렉터'] },
  '木+水': { combo: '성장+지혜', careers: ['교육공학자', '바이오연구원', '환경컨설턴트'] },
  '火+土': { combo: '열정+안정', careers: ['외식사업가', '브랜드매니저', '이벤트디렉터'] },
  '火+金': { combo: '표현+정밀', careers: ['영상편집자', '주얼리디자이너', '치과기공사'] },
  '土+金': { combo: '안정+논리', careers: ['건설엔지니어', '감정평가사', '품질관리자'] },
  '土+水': { combo: '신뢰+소통', careers: ['부동산컨설턴트', '중재인', '사회복지관리자'] },
  '金+水': { combo: '논리+유연', careers: ['AI엔지니어', '데이터사이언티스트', '핀테크개발자'] },
  '木+金': { combo: '창조+정밀', careers: ['외과의사', '정밀기계공학자', '악기제작자'] },
  '火+水': { combo: '열정+지혜', careers: ['저널리스트', '다큐PD', '국제구호활동가'] },
  '木+土': { combo: '성장+관리', careers: ['농업CEO', '교육행정가', '도시계획가'] },
};

// 오행 한자 약자 (콤보 키 생성용)
const ELEMENT_HAN: Record<Element, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};

// 일간 천간 → 오행 매핑
const STEM_ELEMENT: Record<string, Element> = {
  갑: 'wood', 을: 'wood',
  병: 'fire', 정: 'fire',
  무: 'earth', 기: 'earth',
  경: 'metal', 신: 'metal',
  임: 'water', 계: 'water',
};

// 상생 관계: element가 생하는(키우는) 오행
const GENERATES: Record<Element, Element> = {
  wood:  'fire',
  fire:  'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
};

// 오행별 기질 설명 (reason 생성에 사용)
const DAY_STEM_REASON: Record<string, string> = {
  갑: '일간이 甲(갑목)으로 창조와 성장의 기운이 강해',
  을: '일간이 乙(을목)으로 섬세한 창의력과 인내심이 있어',
  병: '일간이 丙(병화)으로 밝고 열정적인 에너지가 넘쳐',
  정: '일간이 丁(정화)으로 따뜻한 열정과 예술적 감성이 풍부해',
  무: '일간이 戊(무토)으로 든든한 안정감과 포용력이 강해',
  기: '일간이 己(기토)으로 세심하고 신뢰감 있는 성품을 지녀',
  경: '일간이 庚(경금)으로 결단력과 강한 의지가 돋보여',
  신: '일간이 辛(신금)으로 정밀하고 날카로운 분석력이 뛰어나',
  임: '일간이 壬(임수)으로 깊은 지혜와 유연한 사고력이 있어',
  계: '일간이 癸(계수)으로 풍부한 감수성과 깊은 통찰력이 있어',
};

const LACKING_REASON: Record<Element, string> = {
  wood:  '木 기운이 부족하므로, 창의적이고 성장 지향적인 분야를 통해 균형을 맞추면',
  fire:  '火 기운이 부족하므로, 열정과 표현력을 키울 수 있는 분야를 통해 균형을 맞추면',
  earth: '土 기운이 부족하므로, 안정적인 관리직을 통해 균형을 맞추면',
  metal: '金 기운이 부족하므로, 논리적이고 정밀한 분야를 통해 균형을 맞추면',
  water: '水 기운이 부족하므로, 지혜와 소통을 키울 수 있는 분야를 통해 균형을 맞추면',
};

/**
 * 오행 조합 키를 순서에 무관하게 정규화합니다.
 * 예: ('火', '木') → '木+火'
 */
function makeComboKey(a: Element, b: Element): string {
  const order: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  const sorted = [a, b].sort((x, y) => order.indexOf(x) - order.indexOf(y));
  return `${ELEMENT_HAN[sorted[0]]}+${ELEMENT_HAN[sorted[1]]}`;
}

/**
 * 사주 결과를 기반으로 직업 5개를 추천합니다.
 *
 * 알고리즘 (다차원):
 * 1. 십성 기반 2개: dominant 십성의 직업 중 2개 (rank 1, 2)
 * 2. 오행 조합 기반 1개: 상위 2개 오행 조합에서 1개 (rank 3)
 * 3. 일간 오행 기반 1개: 기존 오행별 직업에서 십성 추천과 안 겹치는 것 (rank 4 — 보완)
 * 4. 보완 기반 1개: 부족한 오행 직업 (rank 5)
 */
export function recommendCareers(sajuResult: SajuResult): CareerRecommendation[] {
  const dayStem = sajuResult.dayPillar.heavenlyStem;
  const dayElement: Element = STEM_ELEMENT[dayStem] ?? sajuResult.dayPillar.element;
  const lackElement: Element = sajuResult.lackingElement;
  const stemReason = DAY_STEM_REASON[dayStem] ?? `일간이 ${dayStem}으로 독특한 기운이 있어`;

  // 십성 정보
  const sipsung = sajuResult.sipsung;
  const dominant: Sipsung = sipsung?.dominant[0] ?? '비견';
  // secondary: 두 번째 dominant 또는 distribution 기준 차순위
  const allSipsungs: Sipsung[] = [
    '비견', '겁재', '식신', '상관', '편재',
    '정재', '편관', '정관', '편인', '정인',
  ];
  const secondary: Sipsung = (() => {
    if (sipsung?.dominant[1]) return sipsung.dominant[1];
    if (sipsung?.distribution) {
      const dist = sipsung.distribution;
      const runner = allSipsungs
        .filter(s => s !== dominant)
        .sort((a, b) => dist[b] - dist[a])[0];
      if (runner) return runner;
    }
    return '겁재';
  })();
  const dominantTrait = SIPSUNG_CAREER_TRAITS[dominant];
  const secondaryTrait = SIPSUNG_CAREER_TRAITS[secondary];

  // rank 1: dominant 십성 직업 첫 번째
  const rec1Career = dominantTrait.careers[0] ?? '창업가';
  const rec1: CareerRecommendation = {
    rank: 1,
    career: rec1Career,
    element: dayElement,
    fitScore: 95,
    reason: `우리 아이의 ${dominant}(${dominant})이 강해 ${dominantTrait.trait} 성향이 뚜렷합니다. ${rec1Career} 분야에서 타고난 재능을 발휘할 수 있습니다.`,
  };

  // rank 2: dominant 십성 직업 두 번째 (없으면 secondary 첫 번째)
  const rec2Career = dominantTrait.careers[1] ?? secondaryTrait.careers[0] ?? '프리랜서';
  const rec2: CareerRecommendation = {
    rank: 2,
    career: rec2Career,
    element: dayElement,
    fitScore: 90,
    reason: `${dominant}의 ${dominantTrait.trait} 기운이 뒷받침되어 ${rec2Career} 분야에서도 두각을 나타낼 수 있습니다.`,
  };

  // rank 3: 상위 2개 오행 조합 직업
  const top2Elements = sajuResult.strongElements.slice(0, 2) as Element[];
  const el1: Element = top2Elements[0] ?? dayElement;
  const el2: Element = top2Elements[1] ?? GENERATES[dayElement];
  const comboKey = makeComboKey(el1, el2);
  const comboData = ELEMENT_COMBO_CAREERS[comboKey];
  const rec3Career = comboData?.careers[0] ?? ELEMENT_CAREERS[el1][2] ?? '컨설턴트';
  const comboDesc = comboData?.combo ?? `${ELEMENT_HAN[el1]}+${ELEMENT_HAN[el2]}`;
  const rec3: CareerRecommendation = {
    rank: 3,
    career: rec3Career,
    element: el1,
    fitScore: 85,
    reason: `${ELEMENT_KO[el1]}과 ${ELEMENT_KO[el2]}의 ${comboDesc} 조합이 강해, ${rec3Career} 분야에서 두 기운이 시너지를 냅니다.`,
  };

  // rank 4: 일간 오행 기반 (십성 추천과 겹치지 않는 것)
  const usedCareers = new Set([rec1Career, rec2Career, rec3Career]);
  const dayCareerCandidates = ELEMENT_CAREERS[dayElement].filter(c => !usedCareers.has(c));
  const rec4Career = dayCareerCandidates[0] ?? ELEMENT_CAREERS[dayElement][0] ?? '교육자/교수';
  const rec4: CareerRecommendation = {
    rank: 4,
    career: rec4Career,
    element: dayElement,
    fitScore: 82,
    reason: `${stemReason}, ${ELEMENT_KO[dayElement]} 기운을 살린 ${rec4Career} 분야에서 자연스러운 성장이 기대됩니다.`,
  };

  // rank 5: 부족한 오행 보완 직업
  const lackCareers = ELEMENT_CAREERS[lackElement].filter(c => !usedCareers.has(c));
  const rec5Career = lackCareers[0] ?? ELEMENT_CAREERS[lackElement][0] ?? '사회복지사';
  const rec5: CareerRecommendation = {
    rank: 5,
    career: rec5Career,
    element: lackElement,
    fitScore: 78,
    reason: `${LACKING_REASON[lackElement]} 좋겠습니다. ${rec5Career}을(를) 통해 오행 균형을 맞출 수 있습니다.`,
  };

  return [rec1, rec2, rec3, rec4, rec5];
}

// 오행별 Tailwind 색상 클래스 (UI용)
export const ELEMENT_COLOR_CLASS: Record<Element, { bg: string; text: string; bar: string; badge: string }> = {
  wood:  { bg: 'bg-green-50',  text: 'text-green-700',  bar: 'bg-green-400',  badge: 'bg-green-100 text-green-700' },
  fire:  { bg: 'bg-red-50',    text: 'text-red-700',    bar: 'bg-red-400',    badge: 'bg-red-100 text-red-700' },
  earth: { bg: 'bg-amber-50',  text: 'text-amber-700',  bar: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700' },
  metal: { bg: 'bg-slate-50',  text: 'text-slate-700',  bar: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-700' },
  water: { bg: 'bg-blue-50',   text: 'text-blue-700',   bar: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-700' },
};
