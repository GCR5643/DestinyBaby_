import type { EnglishNameSuggestion, EnglishNameOption } from '@/types';
import { callLLM } from '@/lib/llm/llm-client';

export async function generateEnglishNames(
  koreanName: string,
  hanja: string,
  gender: string,
  options: EnglishNameOption[],
  customPrompt?: string
): Promise<EnglishNameSuggestion[]> {
  const systemPrompt = `당신은 다국어 이름 전문가입니다. 한국 이름에 잘 어울리는 영어 이름을 추천합니다. JSON 배열로만 답변하세요.`;

  const optionDescriptions: Record<EnglishNameOption, string> = {
    similar_sound: '발음이 비슷한 영어 이름 (예: 수아→Sua, Sora)',
    similar_meaning: '뜻이 비슷한 영어 이름 (예: 하늘→Celeste, Sky)',
    same_initial: '이니셜이 같은 영어 이름',
    global_popular: '글로벌 인기 이름 중 어울리는 이름',
    custom: customPrompt || '사용자 요청 기준',
  };

  const userPrompt = `한국 이름 "${koreanName}" (${hanja || '한자없음'})에 어울리는 영어 이름을 추천해주세요.
성별: ${gender === 'male' ? '남자' : gender === 'female' ? '여자' : '중성적'}

다음 기준별로 각 3개씩 추천하세요:
${options.map(opt => `- ${opt}: ${optionDescriptions[opt]}`).join('\n')}

JSON 배열로만:
[{"englishName": "Celeste", "matchType": "similar_meaning", "reason": "하늘이라는 뜻의 라틴어 이름", "pronunciation": "셀레스트"}]`;

  try {
    const response = await callLLM(systemPrompt, userPrompt, { temperature: 0.8, maxTokens: 1200 });
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid format');
    return JSON.parse(jsonMatch[0]);
  } catch {
    const fallback: EnglishNameSuggestion[] = [];
    if (options.includes('similar_sound')) {
      fallback.push(
        { englishName: koreanName.length > 1 ? koreanName[0].toUpperCase() + 'u' : 'Su', matchType: 'similar_sound', reason: '한국 이름 발음과 유사', pronunciation: '슈' },
        { englishName: 'Luna', matchType: 'similar_sound', reason: '부드러운 발음이 비슷', pronunciation: '루나' },
        { englishName: 'Mia', matchType: 'similar_sound', reason: '간결하고 발음하기 쉬운 이름', pronunciation: '미아' }
      );
    }
    if (options.includes('similar_meaning')) {
      fallback.push(
        { englishName: 'Celeste', matchType: 'similar_meaning', reason: '하늘/천상의 의미', pronunciation: '셀레스트' },
        { englishName: 'Grace', matchType: 'similar_meaning', reason: '우아함과 은총의 의미', pronunciation: '그레이스' },
        { englishName: 'Aria', matchType: 'similar_meaning', reason: '아름다운 선율의 의미', pronunciation: '아리아' }
      );
    }
    return fallback;
  }
}
