// 5격(五格) 계산 - 전통 작명학 기준
// 천격(天格), 인격(人格), 지격(地格), 외격(外格), 총격(總格)

import { getSuriLuck, type SuriInfo } from './suri-81';

export interface FiveGyeokResult {
  천격: { value: number; suri: SuriInfo };
  인격: { value: number; suri: SuriInfo };
  지격: { value: number; suri: SuriInfo };
  외격: { value: number; suri: SuriInfo };
  총격: { value: number; suri: SuriInfo };
  totalScore: number;      // 0-100 종합 점수
  isAllLucky: boolean;     // 모든 격이 길수인지
  summary: string;         // 종합 해석
}

// 수리 luck 점수 (가중치 적용 전 기본값)
function luckBaseScore(suri: SuriInfo): number {
  switch (suri.luck) {
    case '대길': return 20;
    case '길':   return 15;
    case '반길': return 10;
    case '흉':   return 3;
    case '대흉': return 0;
  }
}

// 종합 해석 생성
function buildSummary(result: Omit<FiveGyeokResult, 'summary'>): string {
  const luckyCount = [result.천격, result.인격, result.지격, result.외격, result.총격]
    .filter(g => g.suri.luck === '대길' || g.suri.luck === '길').length;

  if (result.totalScore >= 80) {
    return `5격 모두 조화로운 이름입니다. 인격(${result.인격.value})·지격(${result.지격.value})·총격(${result.총격.value})이 모두 길수로 성공과 행복의 기운이 강합니다.`;
  } else if (result.totalScore >= 60) {
    return `전반적으로 좋은 수리 구성입니다. ${luckyCount}개 격이 길수로 안정적인 인생 운세를 가집니다.`;
  } else if (result.totalScore >= 40) {
    return `일부 격에서 보완이 필요한 이름입니다. 인격과 총격을 중심으로 수리 조화를 살펴보시기 바랍니다.`;
  } else {
    return `수리격 구성에 주의가 필요한 이름입니다. 획수 조정을 통해 길한 수리를 찾아보시기 바랍니다.`;
  }
}

/**
 * 5격 계산
 *
 * @param surnameStrokes - 성씨 획수
 * @param nameStrokes    - 이름 각 글자 획수 배열 (외자: [n], 2자: [n, m])
 *
 * 계산 공식:
 *   천격(天格) = 성씨 획수 + 1 (단성 기준)
 *   인격(人格) = 성씨 획수 + 이름 첫 글자 획수
 *   지격(地格) = 이름 글자 합 (외자인 경우: 이름 획수 + 1)
 *   외격(外格) = 천격 + 지격 - 인격
 *   총격(總格) = 성씨 획수 + 이름 전체 획수 합
 */
export function calculateFiveGyeok(
  surnameStrokes: number,
  nameStrokes: number[],
): FiveGyeokResult {
  // 이름이 없는 경우 방어
  if (nameStrokes.length === 0) {
    nameStrokes = [1];
  }

  const nameTotal = nameStrokes.reduce((a, b) => a + b, 0);

  // 천격: 성씨 획수 + 1 (단성 기준, 하늘이 부여한 선천적 운)
  const 천격Value = surnameStrokes + 1;

  // 인격: 성씨 획수 + 이름 첫 글자 획수 (중년 운, 사회적 성공)
  const 인격Value = surnameStrokes + nameStrokes[0];

  // 지격: 이름 획수 합 + 1 (전통 작명학: 외자·다자 모두 +1, 초년 운)
  const 지격Value = nameTotal + 1;

  // 외격: 천격 + 지격 - 인격 (대인관계, 사회운)
  const 외격Value = 천격Value + 지격Value - 인격Value;

  // 총격: 성씨 획수 + 이름 전체 획수 합 (종합 운세)
  const 총격Value = surnameStrokes + nameTotal;

  const 천격Suri = getSuriLuck(천격Value);
  const 인격Suri = getSuriLuck(인격Value);
  const 지격Suri = getSuriLuck(지격Value);
  const 외격Suri = getSuriLuck(외격Value);
  const 총격Suri = getSuriLuck(총격Value);

  // totalScore: 각 격 기본 점수 합산, 인격·지격·총격에 가중치 부여 후 100점 기준 정규화
  // 최대 가능 점수 = 20 + (20*1.2) + (20*1.1) + 20 + (20*1.2) = 20 + 24 + 22 + 20 + 24 = 110
  const MAX_SCORE = 110;
  const rawScore =
    luckBaseScore(천격Suri) +
    luckBaseScore(인격Suri) * 1.2 +
    luckBaseScore(지격Suri) * 1.1 +
    luckBaseScore(외격Suri) +
    luckBaseScore(총격Suri) * 1.2;

  const totalScore = Math.min(100, Math.round((rawScore / MAX_SCORE) * 100));

  const isAllLucky = [천격Suri, 인격Suri, 지격Suri, 외격Suri, 총격Suri].every(
    s => s.luck === '대길' || s.luck === '길'
  );

  const partial: Omit<FiveGyeokResult, 'summary'> = {
    천격: { value: 천격Value, suri: 천격Suri },
    인격: { value: 인격Value, suri: 인격Suri },
    지격: { value: 지격Value, suri: 지격Suri },
    외격: { value: 외격Value, suri: 외격Suri },
    총격: { value: 총격Value, suri: 총격Suri },
    totalScore,
    isAllLucky,
  };

  return { ...partial, summary: buildSummary(partial) };
}
