import type { QuickReview, SajuResult } from '@/types';
import { callLLM } from '@/lib/llm/llm-client';

export async function reviewName(
  name: string,
  hanja: string,
  sajuResult: SajuResult
): Promise<QuickReview> {
  const systemPrompt = `당신은 사주 작명 전문가입니다. 이름이 사주에 맞는지 간단히 평가합니다. JSON으로만 답변하세요.`;

  const userPrompt = `이름 "${name}" (${hanja || '한자 미상'})이 다음 사주에 맞는지 평가해주세요:
- 주요 오행: ${sajuResult.mainElement}
- 부족한 오행: ${sajuResult.lackingElement}

JSON으로만:
{"fitScore": 82, "comment": "간단한 평가 2-3문장", "shouldPullCard": true, "cardPullMessage": "이 사주에 맞는 운명 카드를 뽑아보세요!"}`;

  try {
    const response = await callLLM(systemPrompt, userPrompt, { temperature: 0.6, maxTokens: 300 });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid format');
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      fitScore: 78,
      comment: `"${name}"은 좋은 이름입니다. 더 자세한 분석을 위해 상세 리포트를 확인해보세요.`,
      shouldPullCard: true,
      cardPullMessage: '이 사주에 맞는 운명 카드를 뽑아보세요!',
    };
  }
}
