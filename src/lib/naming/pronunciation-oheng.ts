type PronElement = '木' | '火' | '土' | '金' | '水';

export interface PronunciationOhengResult {
  elements: PronElement[];
  pattern: string;
  relations: string[];
  score: number;
  description: string;
}

// 한글 초성 → 오행 매핑
const CHOSEONG_ELEMENT: Record<string, PronElement> = {
  'ㄱ': '木', 'ㅋ': '木',
  'ㄴ': '火', 'ㄷ': '火', 'ㄹ': '火', 'ㅌ': '火',
  'ㅇ': '土', 'ㅎ': '土',
  'ㅅ': '金', 'ㅈ': '金', 'ㅊ': '金',
  'ㅁ': '水', 'ㅂ': '水', 'ㅍ': '水',
  // 쌍자음
  'ㄲ': '木', 'ㄸ': '火', 'ㅃ': '水', 'ㅆ': '金', 'ㅉ': '金',
};

const CHOSEONG_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

// 한글 문자에서 초성 추출
function extractChoseong(char: string): string | null {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return null;
  const choseongIndex = Math.floor(code / (21 * 28));
  return CHOSEONG_LIST[choseongIndex] ?? null;
}

// 오행 상생 관계 판정
function getRelation(from: PronElement, to: PronElement): '상생' | '비화' | '상극' {
  const sangsaeng: Record<PronElement, PronElement> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
  };
  if (from === to) return '비화';
  if (sangsaeng[from] === to) return '상생';
  return '상극';
}

function calcScore(relations: string[]): { score: number; description: string } {
  if (relations.length === 0) {
    return { score: 70, description: '소리의 기운이 무난합니다' };
  }

  const hasSangsaeng = relations.includes('상생');
  const hasBihwa = relations.includes('비화');
  const hasSanggeuk = relations.includes('상극');

  // 연속 상생 (상극 없음, 비화 없음)
  if (hasSangsaeng && !hasBihwa && !hasSanggeuk) {
    return { score: 100, description: '소리의 기운이 자연스럽게 흘러 최고의 조화를 이룹니다' };
  }
  // 상생 + 비화 혼합 (상극 없음)
  if ((hasSangsaeng && hasBihwa) && !hasSanggeuk) {
    return { score: 80, description: '소리의 기운이 대체로 조화로운 배합입니다' };
  }
  // 비화만
  if (hasBihwa && !hasSangsaeng && !hasSanggeuk) {
    return { score: 70, description: '같은 기운이 반복되어 무난한 배합입니다' };
  }
  // 연속 상극 (상생 없음, 비화 없음)
  if (hasSanggeuk && !hasSangsaeng && !hasBihwa) {
    return { score: 30, description: '소리의 기운이 부딪혀 불안정한 배합으로 보완이 필요합니다' };
  }
  // 상생 + 상극 혼합
  return { score: 50, description: '소리의 기운이 다소 어수선한 배합입니다' };
}

/**
 * 발음 오행 분석
 * @param surname 한글 성 (예: "김")
 * @param name 한글 이름 (예: "지우")
 */
export function analyzePronunciationOheng(
  surname: string,
  name: string,
): PronunciationOhengResult {
  const fullName = surname + name;
  const elements: PronElement[] = [];

  for (const char of fullName) {
    const choseong = extractChoseong(char);
    if (choseong !== null) {
      const element = CHOSEONG_ELEMENT[choseong];
      if (element !== undefined) {
        elements.push(element);
      }
    }
  }

  if (elements.length === 0) {
    return {
      elements: [],
      pattern: '',
      relations: [],
      score: 70,
      description: '발음 오행을 분석할 수 없습니다',
    };
  }

  const relations: string[] = [];
  for (let i = 0; i < elements.length - 1; i++) {
    relations.push(getRelation(elements[i]!, elements[i + 1]!));
  }

  const pattern = elements.join('→');
  const { score, description } = calcScore(relations);

  return { elements, pattern, relations, score, description };
}
