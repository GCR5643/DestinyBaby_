import type { TaemyeongSuggestion, SajuResult, Gender } from '@/types';
import { callLLM } from '@/lib/llm/llm-client';

export async function generateTaemyeong(
  parent1Saju: SajuResult,
  parent2Saju?: SajuResult,
  gender: Gender = 'unknown'
): Promise<TaemyeongSuggestion[]> {
  const systemPrompt = `당신은 태명 추천 전문가입니다. 귀엽고 긍정적인 태명을 추천합니다. JSON 배열로만 답변하세요.`;

  const userPrompt = `부모 사주를 참고하여 귀여운 태명 5개를 추천해주세요:
- 엄마 주요 오행: ${parent1Saju.mainElement}
${parent2Saju ? `- 아빠 주요 오행: ${parent2Saju.mainElement}` : ''}
- 성별: ${gender === 'male' ? '남아' : gender === 'female' ? '여아' : '미정'}

JSON 배열로만:
[{"name": "태명", "meaning": "의미 설명", "element": "fire"}]`;

  try {
    const response = await callLLM(systemPrompt, userPrompt, { temperature: 0.9, maxTokens: 600 });
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid format');
    return JSON.parse(jsonMatch[0]).slice(0, 5);
  } catch {
    return [
      { name: '복이', meaning: '복이 가득한 아이', element: 'earth' },
      { name: '별이', meaning: '별처럼 빛나는 아이', element: 'fire' },
      { name: '솔이', meaning: '소나무처럼 건강한 아이', element: 'wood' },
      { name: '빛이', meaning: '밝은 빛 같은 아이', element: 'fire' },
      { name: '새봄', meaning: '새봄처럼 생기 넘치는 아이', element: 'wood' },
    ];
  }
}
