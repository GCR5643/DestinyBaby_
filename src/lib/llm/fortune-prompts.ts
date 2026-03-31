import { callLLM } from '@/lib/llm/llm-client';
import type { SajuResult, FortuneCard, Element } from '@/types';

// 오행별 기질 키워드 (LLM 내부 참고용 - 결과물에 직접 노출하지 않음)
const ELEMENT_TEMPERAMENT: Record<Element, { traits: string[]; energy: string; nurture: string }> = {
  wood: {
    traits: ['호기심 많은', '성장하는', '도전을 좋아하는', '창의적인'],
    energy: '새로운 것을 탐색하고 싶어하는',
    nurture: '바깥 활동, 새로운 놀이, 자유롭게 탐색하는 시간',
  },
  fire: {
    traits: ['활발한', '표현력 풍부한', '열정적인', '사람을 좋아하는'],
    energy: '활기차게 움직이고 싶어하는',
    nurture: '함께 몸을 움직이는 놀이, 칭찬과 응원, 밝고 즐거운 분위기',
  },
  earth: {
    traits: ['따뜻한', '안정을 좋아하는', '배려심 깊은', '꾸준한'],
    energy: '편안하고 안정된 흐름을 좋아하는',
    nurture: '가족과 함께하는 시간, 규칙적인 루틴, 따뜻한 신체 접촉',
  },
  metal: {
    traits: ['집중력 있는', '완벽을 추구하는', '논리적인', '규칙을 중요히 여기는'],
    energy: '질서 있게 집중하고 싶어하는',
    nurture: '퍼즐·블록 같은 집중 놀이, 명확한 약속, 성취감을 느낄 활동',
  },
  water: {
    traits: ['감수성 풍부한', '상상력이 넘치는', '직관적인', '사려 깊은'],
    energy: '조용히 자신만의 세계에 빠져드는',
    nurture: '그림책 읽기, 조용한 창작 활동, 충분한 감정 공감',
  },
};

const FORTUNE_SYSTEM_PROMPT = `당신은 아이의 타고난 기질과 오늘의 흐름을 읽어 부모에게 따뜻한 육아 길잡이를 전해주는 상담사입니다.
사주 명리학을 내부 참고 자료로 활용하되, 결과물에는 전문 용어 없이 오늘 하루 아이에게 잘해줄 수 있는 실용적인 내용으로 풀어냅니다.

반드시 JSON 형식으로 정확히 6개의 카드를 반환하세요.
각 카드는 { "type": string, "emoji": string, "title": string, "content": string, "color": string } 형태입니다.

6개 카드 타입은 반드시 다음 순서로:
1. "fortune" (오늘의 기운) - emoji: "☀️", color: "gold-100"
   오늘 아이의 컨디션·기분·에너지를 부드럽게 예측. "오늘은 ~한 날이에요" 형식으로 부모가 아이를 더 잘 이해하도록 도와주는 2-3문장.

2. "praise" (칭찬 한마디) - emoji: "⭐", color: "primary-100"
   오늘 아이에게 실제로 건넬 수 있는 구체적이고 따뜻한 칭찬 문장 1개 + 그 칭찬이 왜 좋은지 한 문장 설명.

3. "love" (사랑 표현) - emoji: "💖", color: "secondary-100"
   부모가 오늘 아이에게 직접 전할 수 있는 사랑의 말. 아이에게 말 걸듯 쓰되, 부모의 마음이 느껴지는 따뜻한 2-3문장.

4. "fact" (오늘의 발견) - emoji: "🔬", color: "green-100"
   이 아이의 특별한 기질·강점에 대한 흥미로운 사실 또는 발달 관련 인사이트. 오행·사주 용어 없이, "이런 기질의 아이들은…" 형식으로 2-3문장.

5. "conversation" (대화 주제) - emoji: "💬", color: "blue-100"
   오늘 아이와 나눠볼 만한 질문 1개 + 그 대화가 아이에게 어떤 도움이 되는지 한 문장.

6. "parenting" (오늘의 육아 미션) - emoji: "🌱", color: "amber-100"
   오늘 아이와 함께 해보면 좋을 구체적인 활동 1가지. 왜 오늘 이 활동이 좋은지 이유를 포함해 2-3문장.

엄격한 규칙:
- 오행 이름(목·화·토·금·수, wood·fire·earth·metal·water)을 결과물에 절대 언급하지 마세요
- 사주, 팔자, 천간, 지지, 오행, 음양 등 명리학 용어를 결과물에 노출하지 마세요
- 모든 텍스트는 한국어, 따뜻하고 구어체에 가까운 톤
- 부모가 오늘 실천할 수 있는 행동 중심으로 작성
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
  const temperament = ELEMENT_TEMPERAMENT[mainElement];
  const lackingTemperament = ELEMENT_TEMPERAMENT[lackingElement];

  // 오행 정보는 LLM 내부 맥락으로만 전달 — 결과물에 용어가 노출되지 않도록 기질 언어로 변환
  const sajuContext = sajuData
    ? `[아이 기질 분석 — 내부 참고용]
주된 기질: ${temperament.traits.join(', ')}
오늘 에너지 흐름: ${temperament.energy} 날
잘 맞는 양육 방식: ${temperament.nurture}
보완이 필요한 영역: ${lackingTemperament.traits[0]} 성향을 길러주는 경험
일간 천간: ${sajuData.dayPillar.heavenlyStem} (오늘의 기운 계산에 활용)`
    : '[사주 정보 없음 — 일반적인 따뜻한 육아 가이드로 생성]';

  const userPrompt = `오늘 날짜: ${todayDate}
아이 이름: ${nameRef}

${sajuContext}

위 아이의 기질과 오늘의 흐름을 바탕으로, 부모가 오늘 하루 아이에게 잘해줄 수 있는 육아 가이드 6종 카드를 JSON 배열로 생성하세요.
결과물에 오행·사주 용어는 절대 사용하지 마세요.`;

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

// 오행별 fallback 기질 설명 (용어 노출 없이 기질 언어로)
const ELEMENT_FALLBACK: Record<Element, { trait: string; activity: string; insight: string }> = {
  wood: {
    trait: '호기심이 많고 새로운 것을 탐색하길 좋아하는',
    activity: '바깥에서 자유롭게 뛰어놀거나 새로운 놀이를 함께 탐험해보세요',
    insight: '탐구하고 시도하는 과정 자체를 즐기는',
  },
  fire: {
    trait: '표현력이 풍부하고 활기차게 움직이길 좋아하는',
    activity: '함께 신나게 몸을 움직이거나 좋아하는 음악에 맞춰 춤을 춰보세요',
    insight: '감정 표현이 풍부하고 사람과의 교감을 통해 에너지를 얻는',
  },
  earth: {
    trait: '안정감을 좋아하고 가족과 함께하는 시간을 소중히 여기는',
    activity: '온 가족이 함께하는 식사나 따뜻한 스킨십 시간을 가져보세요',
    insight: '한결같은 사랑과 규칙적인 루틴 속에서 가장 잘 자라는',
  },
  metal: {
    trait: '집중력이 뛰어나고 무언가를 완성하는 것에서 기쁨을 느끼는',
    activity: '퍼즐이나 블록처럼 집중해서 완성하는 놀이를 함께 해보세요',
    insight: '명확한 목표와 성취감이 있을 때 더욱 빛을 발하는',
  },
  water: {
    trait: '감수성이 풍부하고 상상의 세계를 즐기는',
    activity: '그림책을 함께 읽거나 아이만의 이야기를 상상해 들어주세요',
    insight: '공감과 경청 속에서 깊은 신뢰를 쌓아가는',
  },
};

// Fallback cards when LLM fails — 오행 용어 없이 기질 중심으로 표현
export function getDefaultFortuneCards(name: string, element: Element): FortuneCard[] {
  const fb = ELEMENT_FALLBACK[element] ?? ELEMENT_FALLBACK.wood;
  return [
    {
      type: 'fortune',
      emoji: '☀️',
      title: '오늘의 기운',
      content: `오늘 ${name}에게는 밝고 따뜻한 기운이 감도는 하루예요. ${fb.trait} 아이라, 오늘도 특유의 매력을 한껏 발휘할 거예요.`,
      color: 'gold-100',
    },
    {
      type: 'praise',
      emoji: '⭐',
      title: '칭찬 한마디',
      content: `"${name}아, 네가 열심히 하는 모습이 정말 대단해!" 오늘 아이가 노력하는 순간을 포착해 구체적으로 칭찬해주세요. 작은 칭찬 하나가 아이의 하루를 빛나게 만들어줘요.`,
      color: 'primary-100',
    },
    {
      type: 'love',
      emoji: '💖',
      title: '사랑 표현',
      content: `"${name}아, 네가 있어서 우리 집이 매일 행복해." 오늘 하루 꼭 한 번 아이를 꼭 안아주고 이 말을 전해주세요. 부모의 따뜻한 말 한마디가 아이의 마음속 깊이 남아요.`,
      color: 'secondary-100',
    },
    {
      type: 'fact',
      emoji: '🔬',
      title: '오늘의 발견',
      content: `${name}처럼 ${fb.insight} 아이들은 사랑받고 있다는 확신이 있을 때 더 크게 성장해요. 오늘 아이의 눈을 바라보며 "너는 정말 특별해"라고 말해주는 것만으로도 큰 힘이 된답니다.`,
      color: 'green-100',
    },
    {
      type: 'conversation',
      emoji: '💬',
      title: '대화 주제',
      content: `"오늘 하루 중에 가장 기억에 남는 게 뭐야?" 아이의 대답에 귀 기울여주세요. 판단 없이 끝까지 들어주는 것만으로도 아이는 마음이 든든해진답니다.`,
      color: 'blue-100',
    },
    {
      type: 'parenting',
      emoji: '🌱',
      title: '오늘의 육아 미션',
      content: `오늘은 ${fb.activity}. 함께하는 시간 자체가 아이에게는 최고의 선물이에요. 완벽하지 않아도 괜찮아요, 함께라는 것이 중요하니까요.`,
      color: 'amber-100',
    },
  ];
}
