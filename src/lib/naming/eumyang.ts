type YinYang = '양' | '음';

export interface EumyangResult {
  pattern: YinYang[];
  patternString: string;
  score: number;
  luck: '길' | '보통' | '흉';
  description: string;
}

// 한자 획수의 홀짝으로 음양 판정
function getYinYang(strokes: number): YinYang {
  return strokes % 2 === 1 ? '양' : '음';
}

// 2자 이름(성+이름2자) 음양 배합 길흉 테이블
const THREE_CHAR_TABLE: Record<string, { score: number; luck: '길' | '보통' | '흉'; description: string }> = {
  '양음양': { score: 100, luck: '길', description: '양이 음을 감싸 조화로운 배합입니다' },
  '음양음': { score: 100, luck: '길', description: '음이 양을 감싸 안정된 배합입니다' },
  '양양음': { score: 80,  luck: '길', description: '점차 안정을 찾는 형으로 발전 가능성이 있습니다' },
  '음음양': { score: 80,  luck: '길', description: '점차 발전하는 형으로 성장하는 기운입니다' },
  '양음음': { score: 60,  luck: '보통', description: '초반 기운이 강하나 후반에 안정을 추구하는 형입니다' },
  '음양양': { score: 60,  luck: '보통', description: '갈수록 강해지는 형으로 후반부 기운이 왕성합니다' },
  '양양양': { score: 30,  luck: '흉', description: '전양(全陽)으로 지나친 강함이 충돌할 수 있어 주의가 필요합니다' },
  '음음음': { score: 30,  luck: '흉', description: '전음(全陰)으로 기운이 위축될 수 있어 보완이 필요합니다' },
};

// 외자 이름(성+이름1자) 음양 배합 길흉 테이블
const TWO_CHAR_TABLE: Record<string, { score: number; luck: '길' | '보통' | '흉'; description: string }> = {
  '양음': { score: 90, luck: '길', description: '음양이 조화를 이루는 배합입니다' },
  '음양': { score: 90, luck: '길', description: '음양이 조화를 이루는 배합입니다' },
  '양양': { score: 60, luck: '보통', description: '양기만 강한 배합으로 균형 보완이 필요합니다' },
  '음음': { score: 60, luck: '보통', description: '음기만 강한 배합으로 균형 보완이 필요합니다' },
};

/**
 * 음양 배합 판정
 * @param surnameStrokes 성의 한자 획수
 * @param nameStrokes 이름 획수 배열 (외자: [n], 2자: [n, m])
 */
export function analyzeEumyang(
  surnameStrokes: number,
  nameStrokes: number[],
): EumyangResult {
  const allStrokes = [surnameStrokes, ...nameStrokes];
  const pattern = allStrokes.map(getYinYang);
  const patternString = pattern.join('');

  if (nameStrokes.length >= 2) {
    const entry = THREE_CHAR_TABLE[patternString];
    if (entry) {
      return { pattern, patternString, ...entry };
    }
    // 예외 케이스 폴백
    return {
      pattern,
      patternString,
      score: 60,
      luck: '보통',
      description: '음양 배합이 무난한 형입니다',
    };
  }

  // 외자 이름
  const entry = TWO_CHAR_TABLE[patternString];
  if (entry) {
    return { pattern, patternString, ...entry };
  }
  return {
    pattern,
    patternString,
    score: 60,
    luck: '보통',
    description: '음양 배합이 무난한 형입니다',
  };
}
