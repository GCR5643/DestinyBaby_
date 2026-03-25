import type { SajuResult } from '@/types';
import { callLLM } from '@/lib/llm/llm-client';

// 오행 한국어 이름 매핑
const ELEMENT_KO: Record<string, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
};

// 오행별 대표 성향 키워드
const ELEMENT_TRAITS: Record<string, string> = {
  wood: '성장·창의·인내',
  fire: '열정·표현·리더십',
  earth: '신뢰·안정·포용',
  metal: '의지·정의·집중',
  water: '지혜·유연·감수성',
};

// 오행별 보완 실천 제안
const ELEMENT_PRACTICE: Record<string, string> = {
  wood: '자연 속 산책, 식물 가꾸기, 창작 활동',
  fire: '밝은 색상 환경, 음악·무용, 사회적 활동',
  earth: '규칙적인 생활 리듬, 흙·도예 활동, 가족 시간',
  metal: '정리정돈 습관, 금속 소품, 집중 학습 환경',
  water: '물 근처 산책, 독서·사색, 수영·목욕 시간',
};

const TONE_SYSTEM = `## 톤앤매너 규칙
1. 부정적 표현 금지: "나쁘다", "흉하다", "위험하다" → "보완이 필요합니다", "주의가 필요합니다"로 대체
2. 단정 금지: "반드시 ~합니다" → "~하는 경향이 있습니다", "~할 가능성이 높습니다"로 표현
3. 건강·질병 관련 예측 절대 금지
4. 모든 분석은 장점 → 보완점 → 조언 순서로 구성
5. 아기의 미래를 축복하는 따뜻한 마무리

## 절대 금지 표현
- 건강 문제·사고·재난 예측 또는 경고
- 이혼·불행한 결혼 예측
- 재물운 실패 단정
- "전생", "업보" 등 미신적 표현
- 특정 직업이나 진로 단정`;

export async function interpretSaju(saju: SajuResult, childName?: string): Promise<string> {
  // 오행 분포 수치 계산 (천간 기준, 각 기둥)
  const elementMap: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar];
  if (saju.hourPillar) pillars.push(saju.hourPillar);
  for (const p of pillars) {
    elementMap[p.element] = (elementMap[p.element] ?? 0) + 1;
  }
  const elementDistribution = Object.entries(elementMap)
    .map(([el, cnt]) => `${ELEMENT_KO[el] ?? el} ${cnt}개`)
    .join(', ');

  const dayMasterKo = ELEMENT_KO[saju.dayPillar.element] ?? saju.dayPillar.element;
  const lackingKo = ELEMENT_KO[saju.lackingElement] ?? saju.lackingElement;
  const strongKo = saju.strongElements.map(e => ELEMENT_KO[e] ?? e).join(', ');
  const practiceTip = ELEMENT_PRACTICE[saju.lackingElement] ?? '균형 잡힌 생활 습관';

  const systemPrompt = `당신은 전통 명리학에 정통한 사주 해석 전문가입니다.
아래 톤앤매너 규칙을 반드시 준수하여 한국어로 답변하세요.

${TONE_SYSTEM}`;

  const hourInfo = saju.hourPillarExcluded
    ? '시주 미포함(시간 미상)'
    : saju.hourPillar
    ? `${saju.hourPillar.heavenlyStem}${saju.hourPillar.earthlyBranch} [${ELEMENT_KO[saju.hourPillar.element] ?? saju.hourPillar.element}, ${saju.hourPillar.yin_yang === 'yin' ? '음' : '양'}]`
    : '미상';

  const userPrompt = `${childName ? `아이 이름: ${childName}\n` : ''}다음 사주를 분석하여 250자 내외의 따뜻하고 전문적인 해석을 작성해주세요.

## 사주 팔자
- 연주(年柱): ${saju.yearPillar.heavenlyStem}${saju.yearPillar.earthlyBranch} [${ELEMENT_KO[saju.yearPillar.element] ?? saju.yearPillar.element}, ${saju.yearPillar.yin_yang === 'yin' ? '음' : '양'}]
- 월주(月柱): ${saju.monthPillar.heavenlyStem}${saju.monthPillar.earthlyBranch} [${ELEMENT_KO[saju.monthPillar.element] ?? saju.monthPillar.element}, ${saju.monthPillar.yin_yang === 'yin' ? '음' : '양'}]
- 일주(日柱): ${saju.dayPillar.heavenlyStem}${saju.dayPillar.earthlyBranch} [${ELEMENT_KO[saju.dayPillar.element] ?? saju.dayPillar.element}, ${saju.dayPillar.yin_yang === 'yin' ? '음' : '양'}] ← 일간(핵심 기운)
- 시주(時柱): ${hourInfo}

## 오행 분포
${elementDistribution}

## 핵심 분석 데이터
- 일간(日干, 아이의 본질): ${dayMasterKo} — 기질: ${ELEMENT_TRAITS[saju.dayPillar.element] ?? ''}
- 강한 오행: ${strongKo}
- 보완이 필요한 오행: ${lackingKo}
- 보완 실천 방안: ${practiceTip}

## 작성 형식
1. 일간 중심 성격·기질 해석 (장점 위주)
2. 오행 분포 특징과 보완 방향 (수치 언급)
3. 따뜻한 축복 마무리 한 문장`;

  return callLLM(systemPrompt, userPrompt, { temperature: 0.75, maxTokens: 500 });
}
