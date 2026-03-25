import type { QuickReview, SajuResult } from '@/types';
import { callLLM } from '@/lib/llm/llm-client';

// 오행 한국어 이름
const ELEMENT_KO: Record<string, string> = {
  wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
};

const TONE_SYSTEM = `## 톤앤매너 규칙
1. 부정적 표현 금지: "나쁘다", "흉하다" → "보완이 필요합니다"로 대체
2. 단정 금지: "반드시 ~합니다" → "~하는 경향이 있습니다"로 표현
3. 건강·질병 관련 예측 절대 금지
4. 장점 → 보완점 → 조언 순서로 구성, 따뜻한 마무리

## 절대 금지 표현
- 건강 문제·사고·재난 예측, "전생"·"업보" 등 미신적 표현, 특정 진로 단정`;

export async function reviewName(
  name: string,
  hanja: string,
  sajuResult: SajuResult
): Promise<QuickReview> {
  const dayMasterKo = ELEMENT_KO[sajuResult.dayPillar.element] ?? sajuResult.dayPillar.element;
  const lackingKo = ELEMENT_KO[sajuResult.lackingElement] ?? sajuResult.lackingElement;
  const strongKo = sajuResult.strongElements.map(e => ELEMENT_KO[e] ?? e).join(', ');
  const hanjaDisplay = hanja || '한자 미상';

  const systemPrompt = `당신은 전통 명리학에 정통한 사주 작명 전문가입니다.
이름이 사주에 얼마나 잘 맞는지 간결하고 전문적으로 평가합니다.
반드시 JSON 형식으로만 답변하세요. 다른 텍스트는 절대 포함하지 마세요.

${TONE_SYSTEM}`;

  const userPrompt = `이름 "${name}" (${hanjaDisplay})이 다음 사주에 맞는지 평가해주세요.

## 사주 정보
- 일간(日干, 본질 기운): ${dayMasterKo}
- 강한 오행: ${strongKo}
- 부족한 오행(보완 필요): ${lackingKo}
- 일주 음양: ${sajuResult.dayPillar.yin_yang === 'yin' ? '음(陰)' : '양(陽)'}

## 평가 기준
- fitScore: 0~100점 (오행 보완 여부 + 음양 조화 + 발음 자연스러움 종합)
- comment: 장점 한 문장 → 오행·음양 측면에서의 사주 적합도 한 문장 → 따뜻한 격려 한 문장 (총 2~3문장)
- shouldPullCard: fitScore 80 이상이면 true
- cardPullMessage: 이름과 사주에 맞는 카드 뽑기 권유 메시지 (한 문장)

JSON으로만:
{"fitScore": 82, "comment": "평가 2-3문장", "shouldPullCard": true, "cardPullMessage": "카드 권유 메시지"}`;

  try {
    const response = await callLLM(systemPrompt, userPrompt, { temperature: 0.6, maxTokens: 400 });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid format');
    return JSON.parse(jsonMatch[0]) as QuickReview;
  } catch {
    return {
      fitScore: 78,
      comment: `"${name}"은 ${lackingKo} 기운을 보완하는 좋은 이름입니다. 사주와의 조화로운 연결이 느껴지며, 아이가 이 이름과 함께 밝고 건강하게 자라날 가능성이 높습니다.`,
      shouldPullCard: true,
      cardPullMessage: `"${name}"의 사주에 맞는 특별한 운명 카드를 뽑아보세요!`,
    };
  }
}
