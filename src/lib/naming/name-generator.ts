import type { NamingInput, SuggestedName, Element } from '@/types';
import { callLLM } from '@/lib/llm/llm-client';
import { getHanjaEntry, getHanjaStrokes } from '@/lib/naming/hanja-strokes';

const ELEMENT_HANJA_CHARS: Record<Element, string[]> = {
  wood: ['林', '森', '木', '桂', '梅', '松', '竹', '花', '春', '茂'],
  fire: ['炫', '曄', '炅', '昱', '晨', '曉', '明', '日', '光', '燦'],
  earth: ['地', '垠', '坤', '大', '厚', '安', '泰', '基', '根', '固'],
  metal: ['金', '鉉', '錫', '銀', '鐘', '堅', '剛', '鍊', '珍', '寶'],
  water: ['海', '澤', '潤', '涵', '源', '淸', '泉', '湖', '洙', '濬'],
};

// 오행 한국어 이름
const ELEMENT_KO: Record<Element, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
};

// 오행별 대표 한자 의미 설명
const ELEMENT_MEANING: Record<Element, string> = {
  wood: '성장·생명력·창의를 상징하는 나무 계열',
  fire: '열정·빛·지혜를 상징하는 불·빛 계열',
  earth: '안정·신뢰·포용을 상징하는 땅·대지 계열',
  metal: '의지·순수·단단함을 상징하는 금속·보석 계열',
  water: '지혜·유연·풍요를 상징하는 물·흐름 계열',
};

// LLM이 반환한 이름 중 HANJA_STROKE_DB에 존재하는 한자만 통과시키고,
// 통과한 이름의 획수를 DB 기준으로 교정합니다.
function validateAndCorrectNames(
  raw: Array<{ name: string; hanja: string; reasonShort: string; sajuScore?: number }>,
  element: Element,
): SuggestedName[] {
  const valid: SuggestedName[] = [];
  for (const n of raw) {
    if (!n.hanja) {
      valid.push({
        name: n.name,
        hanja: n.hanja,
        reasonShort: n.reasonShort,
        sajuScore: n.sajuScore ?? Math.round(75 + Math.random() * 20),
        element,
      });
      continue;
    }
    const chars = Array.from(n.hanja);
    // CJK 유니코드 범위(U+4E00~U+9FFF, U+3400~U+4DBF, U+F900~U+FAFF)에 없는 글자만 필터링
    const isValidHanja = (c: string) => {
      const cp = c.codePointAt(0) ?? 0;
      return (cp >= 0x4E00 && cp <= 0x9FFF) || (cp >= 0x3400 && cp <= 0x4DBF) || (cp >= 0xF900 && cp <= 0xFAFF);
    };
    const hasInvalidChar = chars.some(c => !isValidHanja(c));
    if (hasInvalidChar) {
      console.warn(`[naming] LLM이 유효하지 않은 한자를 생성: ${n.hanja} (이름: ${n.name})`);
      continue;
    }
    const notInDb = chars.filter(c => getHanjaEntry(c) === null);
    if (notInDb.length > 0) {
      console.warn(`[naming] DB에 없는 한자 포함(유니코드 추정값 사용): ${notInDb.join(', ')} (이름: ${n.name})`);
    }
    // DB 기준 실제 획수 합계 (향후 수리격 계산에 사용)
    const actualStrokes = chars.reduce((sum, char) => sum + getHanjaStrokes(char), 0);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[naming] ${n.name}(${n.hanja}) 획수 합계: ${actualStrokes}`);
    }
    valid.push({
      name: n.name,
      hanja: n.hanja,
      reasonShort: n.reasonShort,
      sajuScore: n.sajuScore ?? Math.round(75 + Math.random() * 20),
      element,
    });
  }
  return valid;
}

function getComplementaryElement(element: Element): Element {
  const generates: Record<Element, Element> = {
    wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood',
  };
  return generates[element];
}

const TONE_SYSTEM = `## 톤앤매너 규칙
1. 부정적 표현 금지: "나쁘다", "흉하다" → "보완이 필요합니다"로 대체
2. 단정 금지: "반드시 ~합니다" → "~하는 경향이 있습니다"로 표현
3. 건강·질병 관련 예측 절대 금지
4. 이름의 장점과 사주와의 연관성을 따뜻하게 설명

## 절대 금지 표현
- 건강 문제·사고·재난 예측 또는 경고
- "전생", "업보" 등 미신적 표현
- 특정 직업이나 진로 단정`;

export async function generateNames(input: NamingInput): Promise<SuggestedName[]> {
  // 아기 사주가 있으면 아기 사주 기반, 없으면 부모1 사주 기반으로 오행 보완
  const baseSaju = input.babySaju ?? input.parent1Saju;
  const lackingElement = baseSaju.lackingElement;
  const complementElement = getComplementaryElement(lackingElement);
  const targetChars = ELEMENT_HANJA_CHARS[complementElement];

  const babyLacking = baseSaju.lackingElement;
  const babyMainElement = baseSaju.mainElement;

  // 음양 정보
  const dayYinYang = baseSaju.dayPillar.yin_yang === 'yin' ? '음(陰)' : '양(陽)';

  const systemPrompt = `당신은 전통 명리학과 작명학에 정통한 작명 전문가입니다.
사주 오행의 균형을 맞추고, 한자의 획수·음양오행·수리격을 고려하여
아름답고 의미 있는 이름을 추천합니다.
반드시 JSON 배열 형식으로만 답변하세요. 다른 텍스트는 절대 포함하지 마세요.

${TONE_SYSTEM}`;

  const sajuBasis = input.babySaju ? '아기 사주' : '부모1 사주';

  const userPrompt = `다음 사주 조건에 맞는 한국 아기 이름 5개를 추천해주세요.

## 사주 분석 결과 (${sajuBasis} 기반)
- 성별: ${input.gender === 'male' ? '남자' : input.gender === 'female' ? '여자' : '미정'}
${input.surname ? `- 성씨: ${input.surname}${input.surnameHanja ? `(${input.surnameHanja})` : ''} — 성씨 '${input.surname}' + 이름 조합이 자연스럽게 어울려야 합니다` : ''}
- 일간(日干) 기운: ${ELEMENT_KO[babyMainElement as Element] ?? babyMainElement} / 음양: ${dayYinYang}
- 부족한 오행: ${ELEMENT_KO[babyLacking as Element] ?? babyLacking}
- 보완할 오행(생(生)하는 오행): ${ELEMENT_KO[complementElement]} — ${ELEMENT_MEANING[complementElement]}
${input.hangryeolChar ? `- 항렬 글자: ${input.hangryeolChar}` : ''}
${input.siblingNames?.length ? `- 형제자매 이름: ${input.siblingNames.join(', ')}` : ''}
${input.preferences?.preferredElements?.length ? `- 선호 오행: ${input.preferences.preferredElements.map(e => ELEMENT_KO[e]).join(', ')}` : ''}
${input.preferences?.avoidChars?.length ? `- 피할 글자: ${input.preferences.avoidChars.join(', ')}` : ''}

## 한자 선택 기준
- 보완 오행(${ELEMENT_KO[complementElement]}) 계열 추천 한자: ${targetChars.slice(0, 6).join(', ')}
- 음양 밸런스: 이름 전체가 음양이 조화를 이루도록 선택
- 수리격: 원격(元格)·형격(亨格)·이격(利格)·정격(貞格) 중 길격(吉格) 위주

## reasonShort 작성 지침
- 선택한 한자가 왜 이 사주에 맞는지 오행과 연결하여 1~2문장으로 설명
- 음양 밸런스나 수리격 특징 한 가지 포함
- 따뜻하고 희망적인 어조 유지

아래 형식의 JSON 배열로만 답변하세요. 반드시 배열([])로 시작하고 배열로 끝나야 합니다. 설명, 마크다운, 코드블록 없이 순수 JSON만 출력하세요:
[
  {"name": "지우", "hanja": "智宇", "reasonShort": "사주와의 연관성 설명 1-2문장", "sajuScore": 85},
  {"name": "서연", "hanja": "瑞然", "reasonShort": "사주와의 연관성 설명 1-2문장", "sajuScore": 83}
]`;

  type RawName = { name: string; hanja: string; reasonShort: string; sajuScore?: number };

  async function parseLLMResponse(response: string): Promise<RawName[]> {
    // 배열 형태 매칭 시도
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]) as RawName[];
    }
    // 단일 객체 형태 매칭 (LLM이 배열 대신 객체를 반환하는 경우)
    const objectMatch = response.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      const parsed = JSON.parse(objectMatch[0]);
      // 단일 객체면 배열로 감싸기
      if (!Array.isArray(parsed) && parsed.name) {
        return [parsed] as RawName[];
      }
    }
    throw new Error('Invalid response format: no JSON array or object found');
  }

  try {
    const response = await callLLM(systemPrompt, userPrompt, { temperature: 0.8, maxTokens: 1200 });
    const raw = await parseLLMResponse(response);
    let validated = validateAndCorrectNames(raw.slice(0, 10), complementElement);

    // 검증 통과한 이름이 5개 미만이면 1회 재시도
    if (validated.length < 5) {
      console.warn(`[naming] 검증 통과 이름 ${validated.length}개 — LLM 재호출 시도`);
      try {
        const retryResponse = await callLLM(systemPrompt, userPrompt, { temperature: 0.9, maxTokens: 1200 });
        const retryRaw = await parseLLMResponse(retryResponse);
        const retryValidated = validateAndCorrectNames(retryRaw.slice(0, 10), complementElement);
        // 기존 통과 이름에 재시도 결과를 합쳐 중복 제거
        const seen = new Set(validated.map(n => n.hanja));
        for (const n of retryValidated) {
          if (!seen.has(n.hanja)) {
            validated.push(n);
            seen.add(n.hanja);
          }
        }
      } catch {
        // 재시도 실패 시 기존 검증 결과만 사용
      }
    }

    // 최소 1개라도 반환, 최대 5개
    if (validated.length === 0) throw new Error('No valid hanja names');
    return validated.slice(0, 5);
  } catch (err) {
    console.error('[naming] LLM 이름 생성 실패:', err instanceof Error ? err.message : err);
    // 에러를 클라이언트에 전파 — 사용자가 "다시 시도" 할 수 있도록
    throw new Error('AI 이름 추천 서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해주세요.');
  }
}
