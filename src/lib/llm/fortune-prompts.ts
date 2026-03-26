import { callLLM } from '@/lib/llm/llm-client';
import type { SajuResult, FortuneCard, Element } from '@/types';

// 오행별 활동 추천 참고
const ELEMENT_ACTIVITIES: Record<Element, string[]> = {
  wood: ['자연 산책', '그림 그리기', '식물 키우기', '새로운 것 배우기', '스트레칭'],
  fire: ['활발한 놀이', '춤추기', '요리 함께하기', '밝은 색 옷 입기', '칭찬 많이 하기'],
  earth: ['블록 쌓기', '흙놀이', '정리정돈', '가족 식사', '안정적인 루틴'],
  metal: ['퍼즐 맞추기', '악기 연주', '규칙적인 활동', '깨끗한 환경', '숫자 놀이'],
  water: ['물놀이', '그림책 읽기', '음악 듣기', '조용한 시간', '상상력 놀이'],
};

const FORTUNE_SYSTEM_PROMPT = `당신은 한국 전통 명리학(사주팔자) 전문가이자 아이 육아 전문 상담사입니다.
부모가 아이의 사주 정보를 제공하면, 오늘 날짜의 천간지지와 아이 사주의 조합을 기반으로
따뜻하고 긍정적인 일일 운수 콘텐츠를 생성합니다.

반드시 JSON 형식으로 정확히 6개의 카드를 반환하세요.
각 카드는 { "type": string, "emoji": string, "title": string, "content": string, "color": string } 형태입니다.

6개 카드 타입은 반드시 다음 순서로:
1. "fortune" (오늘의 운세) - emoji: "☀️", color: "gold-100" - 3-4줄 사주 기반 하루 운세
2. "praise" (칭찬 한마디) - emoji: "⭐", color: "primary-100" - 구체적 행동 기반 칭찬 문장
3. "love" (사랑 표현) - emoji: "💖", color: "secondary-100" - 따뜻한 사랑/격려 메시지
4. "fact" (새로운 사실) - emoji: "🔬", color: "green-100" - 아이 발달/사주 기반 재미있는 팩트
5. "conversation" (대화 주제) - emoji: "💬", color: "blue-100" - 아이와 나눌 질문 1개
6. "parenting" (육아팁) - emoji: "🌱", color: "amber-100" - 오행에 맞는 활동 추천

규칙:
- 모든 텍스트는 한국어
- 따뜻하고 긍정적인 톤, 부모의 마음을 어루만지는 표현
- 사주 전문 용어는 최소화, 쉬운 말로 풀어서 설명
- 각 카드 content는 2-4문장으로 간결하게
- 아이 이름이 있으면 이름을 사용, 없으면 "우리 아이"로 지칭
- 반드시 유효한 JSON 배열만 반환 (다른 텍스트 없이)`;

export async function generateDailyFortune(
  childName: string | undefined,
  sajuData: SajuResult | undefined,
  todayDate: string,
): Promise<FortuneCard[]> {
  const nameRef = childName || '우리 아이';
  const mainElement = sajuData?.mainElement || 'wood';
  const lackingElement = sajuData?.lackingElement || 'water';
  const activities = ELEMENT_ACTIVITIES[mainElement] || ELEMENT_ACTIVITIES.wood;

  const userPrompt = `오늘 날짜: ${todayDate}

아이 이름: ${nameRef}
${sajuData ? `주요 오행: ${mainElement} (${getElementKo(mainElement)})
부족 오행: ${lackingElement} (${getElementKo(lackingElement)})
일간: ${sajuData.dayPillar.heavenlyStem}
강한 오행: ${sajuData.strongElements.map(getElementKo).join(', ')}
약한 오행: ${sajuData.weakElements.map(getElementKo).join(', ')}` : '사주 정보 없음 (일반적인 운세로 생성)'}

추천 활동 참고: ${activities.join(', ')}

위 정보를 기반으로 오늘의 운수 6종 카드를 JSON 배열로 생성하세요.`;

  try {
    const raw = await callLLM(FORTUNE_SYSTEM_PROMPT, userPrompt, {
      temperature: 0.85,
      maxTokens: 1500,
    });

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[fortune] Failed to extract JSON from LLM response');
      return getDefaultFortuneCards(nameRef, mainElement);
    }

    const cards: FortuneCard[] = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(cards) || cards.length !== 6) {
      console.error('[fortune] Invalid card count:', cards.length);
      return getDefaultFortuneCards(nameRef, mainElement);
    }

    return cards;
  } catch (err) {
    console.error('[fortune] LLM call failed:', err);
    return getDefaultFortuneCards(nameRef, mainElement);
  }
}

function getElementKo(element: Element | string): string {
  const map: Record<string, string> = {
    wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
  };
  return map[element] || element;
}

// Fallback cards when LLM fails
export function getDefaultFortuneCards(name: string, element: Element): FortuneCard[] {
  return [
    { type: 'fortune', emoji: '☀️', title: '오늘의 운세', content: `${name}에게 밝은 기운이 감도는 하루입니다. 새로운 것을 시도하기 좋은 날이에요.`, color: 'gold-100' },
    { type: 'praise', emoji: '⭐', title: '칭찬 한마디', content: `"${name}아, 오늘도 씩씩하게 잘 지내줘서 정말 고마워!" 작은 노력도 크게 칭찬해주세요.`, color: 'primary-100' },
    { type: 'love', emoji: '💖', title: '사랑 표현', content: `${name}이(가) 세상에 와줘서 매일이 선물 같아요. 오늘도 꼭 안아주세요.`, color: 'secondary-100' },
    { type: 'fact', emoji: '🔬', title: '새로운 사실', content: `${getElementKo(element)}의 기운을 가진 아이들은 ${element === 'wood' ? '창의력' : element === 'fire' ? '열정' : element === 'earth' ? '안정감' : element === 'metal' ? '집중력' : '감수성'}이 뛰어난 경우가 많아요.`, color: 'green-100' },
    { type: 'conversation', emoji: '💬', title: '대화 주제', content: `"오늘 가장 재미있었던 일이 뭐야?" 아이의 하루를 물어봐 주세요.`, color: 'blue-100' },
    { type: 'parenting', emoji: '🌱', title: '육아팁', content: `${getElementKo(element)} 기운의 아이에게는 ${ELEMENT_ACTIVITIES[element]?.[0] || '자연 산책'}이(가) 좋아요. 오늘 함께 해보세요!`, color: 'amber-100' },
  ];
}
