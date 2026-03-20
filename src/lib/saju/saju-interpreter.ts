import type { SajuResult } from '@/types';
import { callLLM } from '@/lib/llm/llm-client';

export async function interpretSaju(saju: SajuResult, childName?: string): Promise<string> {
  const systemPrompt = `당신은 친절하고 긍정적인 사주 해석 전문가입니다.
항상 밝고 희망적인 관점에서 사주를 해석하며, 부정적인 표현은 피하고
개인의 잠재력과 가능성을 강조합니다. 한국어로 답변하세요.`;

  const userPrompt = `다음 사주 정보를 바탕으로 긍정적이고 따뜻한 해석을 200자 이내로 작성해주세요:
- 주요 오행: ${saju.mainElement}
- 보완 오행: ${saju.lackingElement}
- 강한 오행: ${saju.strongElements.join(', ')}
- 연주: ${saju.yearPillar.heavenlyStem}${saju.yearPillar.earthlyBranch}
- 일주: ${saju.dayPillar.heavenlyStem}${saju.dayPillar.earthlyBranch}
${childName ? `- 아이 이름: ${childName}` : ''}`;

  return callLLM(systemPrompt, userPrompt, { temperature: 0.8, maxTokens: 300 });
}
