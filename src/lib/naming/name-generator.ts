import type { NamingInput, SuggestedName, Element } from '@/types';
import { callLLM } from '@/lib/llm/llm-client';

const ELEMENT_HANJA_CHARS: Record<Element, string[]> = {
  wood: ['林', '森', '木', '桂', '梅', '松', '竹', '花', '春', '茂'],
  fire: ['炫', '曄', '炅', '昱', '晨', '曉', '明', '日', '光', '燦'],
  earth: ['地', '垠', '坤', '大', '厚', '安', '泰', '基', '根', '固'],
  metal: ['金', '鉉', '錫', '銀', '鐘', '堅', '剛', '鍊', '珍', '寶'],
  water: ['海', '澤', '潤', '涵', '源', '淸', '泉', '湖', '洙', '濬'],
};

function getComplementaryElement(element: Element): Element {
  const generates: Record<Element, Element> = {
    wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood',
  };
  return generates[element];
}

export async function generateNames(input: NamingInput): Promise<SuggestedName[]> {
  const lackingElement = input.parent1Saju.lackingElement;
  const complementElement = getComplementaryElement(lackingElement);
  const targetChars = ELEMENT_HANJA_CHARS[complementElement];

  const systemPrompt = `당신은 전통 명리학에 정통한 작명 전문가입니다.
사주 오행의 균형을 맞추고, 한자의 획수와 음양오행을 고려하여 아름답고 의미 있는 이름을 추천합니다.
반드시 JSON 배열 형식으로만 답변하세요.`;

  const userPrompt = `다음 조건에 맞는 한국 아기 이름 5개를 추천해주세요:
- 성별: ${input.gender === 'male' ? '남자' : input.gender === 'female' ? '여자' : '미정'}
- 보완할 오행: ${complementElement} (${lackingElement} 기운 보완)
- 추천 한자 계열: ${targetChars.slice(0, 5).join(', ')}
${input.hangryeolChar ? `- 항렬 글자: ${input.hangryeolChar}` : ''}
${input.siblingNames?.length ? `- 형제 이름: ${input.siblingNames.join(', ')}` : ''}

JSON 배열로만 답변 (다른 텍스트 없이):
[{"name": "이름", "hanja": "漢字", "reasonShort": "1줄 이유", "sajuScore": 85}]`;

  try {
    const response = await callLLM(systemPrompt, userPrompt, { temperature: 0.8, maxTokens: 1000 });
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid response format');

    const names = JSON.parse(jsonMatch[0]);
    return names.slice(0, 5).map((n: any) => ({
      name: n.name,
      hanja: n.hanja,
      reasonShort: n.reasonShort,
      sajuScore: n.sajuScore || Math.round(75 + Math.random() * 20),
      element: complementElement,
    }));
  } catch {
    // Fallback names
    return [
      { name: '지우', hanja: '智宇', reasonShort: '지혜롭고 드넓은 기운을 가진 이름', sajuScore: 88, element: complementElement },
      { name: '서연', hanja: '瑞然', reasonShort: '상서로운 기운이 자연스럽게 흐르는 이름', sajuScore: 85, element: complementElement },
      { name: '하준', hanja: '夏俊', reasonShort: '여름처럼 밝고 준수한 기운', sajuScore: 83, element: complementElement },
      { name: '유나', hanja: '裕娜', reasonShort: '풍요롭고 우아한 기운을 담은 이름', sajuScore: 80, element: complementElement },
      { name: '민준', hanja: '敏俊', reasonShort: '영특하고 준수한 기운이 깃든 이름', sajuScore: 82, element: complementElement },
    ];
  }
}
