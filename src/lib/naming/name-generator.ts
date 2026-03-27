import type { NamingInput, SuggestedName, Element, TrendLevel } from '@/types';
import { callLLM } from '@/lib/llm/llm-client';
import { getHanjaEntry, getHanjaStrokes } from '@/lib/naming/hanja-strokes';
import { recommendJawonHanja } from '@/lib/naming/jawon-oheng';
import { isBulyongHard } from '@/lib/naming/bulyong-hanja';

// ── 자원오행 추천 한자를 LLM 프롬프트용 문자열로 변환 ──
function getJawonRecommendation(element: Element, gender?: string): string {
  const g = gender === 'male' ? 'M' : gender === 'female' ? 'F' : undefined;
  const recs = recommendJawonHanja(element, g);
  const chars = recs.primary.slice(0, 10).map(h => `${h.hanja}(${h.reading})`).join(', ');
  return chars || '(해당 오행 한자 DB 참조)';
}

// ── 트렌디함 레벨별 LLM 프롬프트 지시문 ──────────────────────────────────────
const TREND_INSTRUCTIONS: Record<TrendLevel, { label: string; directive: string; examples: Record<'male' | 'female' | 'unknown', string> }> = {
  trendy: {
    label: '요즘 인기 이름',
    directive: `## 이름 스타일: 트렌디 (요즘 인기)
- 2022~2025년 대한민국 출생신고 상위권에 있는 최신 트렌드 이름 스타일로 추천하세요.
- 요즘 부모들이 실제로 많이 짓는 세련되고 현대적인 감각의 이름을 우선하세요.
- 순우리말 이름(예: 하늘, 이든, 소율, 다온)도 적극 포함 가능합니다.
- 너무 고전적이거나 올드한 느낌의 이름은 피하세요.`,
    examples: {
      male: '이든, 시우, 하준, 서진, 지안, 유준, 이안, 레오, 도윤, 건우, 태오, 서율, 은호, 선우, 지율',
      female: '하윤, 서아, 지유, 다인, 소율, 이서, 리안, 지아, 다온, 서율, 유나, 하린, 아인, 소이, 서하',
      unknown: '이든, 하윤, 시우, 서아, 지유, 하준, 다온, 서율, 소이, 지안',
    },
  },
  balanced: {
    label: '균형잡힌 이름',
    directive: `## 이름 스타일: 균형 (현대적이면서 품격 있는)
- 너무 유행을 타지도, 너무 고전적이지도 않은 균형잡힌 이름을 추천하세요.
- 현대적 감각과 전통적 품격을 모두 갖춘 이름이 이상적입니다.
- 10년 후에도 자연스럽게 불릴 수 있는 시대를 타지 않는 이름을 지향하세요.`,
    examples: {
      male: '서준, 도윤, 지호, 예준, 현우, 주원, 민준, 승현, 태윤, 건호, 준혁, 시윤, 도현, 유찬, 재원',
      female: '서윤, 하은, 수아, 예은, 윤서, 채원, 서현, 예린, 수빈, 지윤, 시은, 채은, 다현, 민서, 유진',
      unknown: '서윤, 서준, 하윤, 도윤, 지유, 시우, 하은, 예준, 수아, 지호',
    },
  },
  classic: {
    label: '전통 고전 이름',
    directive: `## 이름 스타일: 클래식 (전통 고전)
- 전통 명리학에 충실하고, 격조 있는 고전적 한국 이름을 추천하세요.
- 한자의 뜻과 음이 깊고 품격이 있는 이름을 우선하세요.
- 시대를 초월하는 정통 작명법에 따른 이름 (수리격·음양오행 중시).
- 순우리말 이름보다는 한자 기반의 전통적 이름을 선호합니다.
- 조부모 세대가 들어도 "좋은 이름"이라고 느낄 수 있는 격식 있는 이름이어야 합니다.`,
    examples: {
      male: '정훈, 성현, 태현, 준호, 영민, 상현, 민혁, 재훈, 승호, 경민, 현준, 동현, 진우, 태호, 윤혁',
      female: '은지, 수현, 지현, 예지, 혜원, 민지, 서영, 현정, 정은, 유정, 보람, 은수, 혜진, 지영, 나현',
      unknown: '정훈, 수현, 성현, 지현, 태현, 예지, 준호, 혜원, 영민, 민지',
    },
  },
};

// ── 한국 작명에서 실제 사용되는 오행별 인기 한자 ──────────────────────────────
// 대한민국 출생신고 기준 인기 한자 위주, 중국식 전용 한자 제외
const ELEMENT_HANJA_CHARS: Record<Element, string[]> = {
  wood: ['英', '榮', '桓', '彬', '樹', '柱', '棟', '松', '梓', '蓮', '芝', '花'],
  fire: ['炫', '映', '煥', '燦', '曙', '明', '晶', '昊', '星', '旻', '光', '暎'],
  earth: ['恩', '安', '堅', '培', '聖', '在', '均', '奎', '翊', '宇', '基', '泰'],
  metal: ['鎭', '鉉', '善', '成', '真', '珍', '瑞', '銀', '鑫', '鋼', '寶', '尚'],
  water: ['浩', '潤', '泳', '洙', '河', '漢', '湖', '澄', '泰', '淵', '淑', '淨'],
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

// ── 중국식 이름 필터 ──────────────────────────────────────────────────────────
// 중국어 병음(pinyin) 음독을 한글로 옮긴 패턴 탐지
const CHINESE_SYLLABLES: string[] = [
  '쯔', '즈', '웨이', '린', '첸', '텐', '밍', '샹', '옌', '팡',
  '칭', '훙', '징', '쉬', '치', '슈', '주이', '쿤', '량', '빈',
  '잉', '췐', '줜', '퀀', '뤼', '뤄', '위안', '싱', '핑',
  '탕', '톈', '위', '쑤', '쉬안', '지안', '리앙', '씬', '쓰',
];
// 한국 이름에 거의 쓰이지 않는 음절 패턴 (3글자 이상 + 외래식)
function isChineseStyleName(name: string): boolean {
  // 4글자 이상 한글 이름 → 거의 확실히 비한국식
  if (name.length >= 4) return true;
  // 음절 분리 후 중국식 음절 매칭
  for (let i = 0; i < CHINESE_SYLLABLES.length; i++) {
    if (name.includes(CHINESE_SYLLABLES[i])) return true;
  }
  return false;
}

// LLM이 반환한 이름 검증: 한국식 필터 + 한자 유효성 + 획수 교정
function validateAndCorrectNames(
  raw: Array<{ name: string; hanja: string; reasonShort: string; sajuScore?: number }>,
  element: Element,
): SuggestedName[] {
  const valid: SuggestedName[] = [];
  for (const n of raw) {
    // 1) 한글 이름이 없으면 스킵
    if (!n.name || n.name.trim().length === 0) continue;

    // 2) 중국식 이름 필터
    if (isChineseStyleName(n.name)) {
      console.warn(`[naming] 중국식 이름 필터링: "${n.name}" (${n.hanja})`);
      continue;
    }

    // 3) 한글이 아닌 문자가 포함된 이름 필터 (한글 자모 범위: AC00-D7AF, 1100-11FF)
    const hasNonKorean = /[^\uAC00-\uD7AF]/.test(n.name);
    if (hasNonKorean) {
      console.warn(`[naming] 비한글 문자 포함 이름 필터링: "${n.name}"`);
      continue;
    }

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
    // 4) 불용한자 필터 — hard 불용한자가 포함된 이름 제외
    const hasBulyong = chars.some(c => isBulyongHard(c));
    if (hasBulyong) {
      console.warn(`[naming] 불용한자 포함 이름 필터링: "${n.name}" (${n.hanja})`);
      continue;
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

  const systemPrompt = `당신은 대한민국 전문 작명가입니다. 한국 명리학과 작명학에 정통합니다.

## 핵심 원칙: 반드시 한국식 이름만 생성
- 한국 부모가 2020~2025년 실제 출생신고에 사용하는 스타일의 이름만 추천하세요.
- name 필드는 반드시 한글로, 한국인이 일상에서 자연스럽게 부르는 이름이어야 합니다.
- "~아", "~이"로 부를 수 있는 자연스러운 한국 이름이어야 합니다.

## 절대 금지 — 중국식 이름
아래와 같은 중국식 이름 패턴은 절대 생성하지 마세요:
- 중국어 음독을 한글로 옮긴 이름 (예: 린하오, 첸위, 메이린, 즈한, 웨이, 샤오)
- 한국에서 사용하지 않는 외래식 음절 조합 (예: 쯔, 즈, 웨이, 린, 첸, 텐, 밍, 샹)
- 3음절 이상의 비(非)한국식 이름
- 중국 인명에서 흔한 한자 조합의 한글 음독 (예: 浩然→호연은 OK, 但 紫涵→자함은 NG)

## 한국식 이름 예시 (이런 스타일로)
남아: 서준, 도윤, 시우, 하준, 은우, 지호, 예준, 건우, 현우, 주원, 민준, 유준, 지환, 승현, 태윤
여아: 서윤, 서아, 하윤, 지유, 하은, 수아, 예은, 지아, 윤서, 채원, 소율, 다인, 서현, 예린, 하린

## 한자(hanja) 선택 기준
- 한자는 한국 작명에서 실제 사용되는 글자만 선택하세요.
- 한글 이름의 음(音)에 맞는 한자를 배정하세요 (이름이 먼저, 한자는 뜻을 보강).
- 같은 음이라도 한국에서 인기있는 한자를 우선 선택하세요.

반드시 JSON 배열 형식으로만 답변하세요. 다른 텍스트는 절대 포함하지 마세요.

${TONE_SYSTEM}`;

  const sajuBasis = input.babySaju ? '아기 사주' : '부모1 사주';

  // 성별에 따른 한국 인기 이름 레퍼런스
  // 트렌디함 레벨에 따른 이름 레퍼런스
  const trend = TREND_INSTRUCTIONS[input.trendLevel ?? 'balanced'];
  const genderKey = input.gender === 'male' ? 'male' : input.gender === 'female' ? 'female' : 'unknown';
  const genderExamples = trend.examples[genderKey];

  const userPrompt = `다음 사주 조건에 맞는 한국식 아기 이름 7개를 추천해주세요.

${trend.directive}

## 최우선 규칙: 한국식 이름만
- 아래 레퍼런스와 비슷한 음절 감각의 이름: ${genderExamples}
- 이름은 2글자(두 음절)를 기본으로 하되, 외자(1글자)도 1~2개 포함 가능
- 중국식/일본식 이름 절대 금지

## 사주 분석 결과 (${sajuBasis} 기반)
- 성별: ${input.gender === 'male' ? '남자' : input.gender === 'female' ? '여자' : '미정'}
${input.surname ? `- 성씨: ${input.surname}${input.surnameHanja ? `(${input.surnameHanja})` : ''} — "${input.surname}" + 이름 전체를 소리내어 읽었을 때 자연스럽고 부르기 좋아야 합니다` : ''}
- 일간(日干) 기운: ${ELEMENT_KO[babyMainElement as Element] ?? babyMainElement} / 음양: ${dayYinYang}
- 부족한 오행: ${ELEMENT_KO[babyLacking as Element] ?? babyLacking}
- 보완할 오행(생(生)하는 오행): ${ELEMENT_KO[complementElement]} — ${ELEMENT_MEANING[complementElement]}
${input.hangryeolChar ? `- 항렬 글자: ${input.hangryeolChar}` : ''}
${input.siblingNames?.length ? `- 형제자매 이름: ${input.siblingNames.join(', ')}` : ''}
${input.preferences?.preferredElements?.length ? `- 선호 오행: ${input.preferences.preferredElements.map(e => ELEMENT_KO[e]).join(', ')}` : ''}
${input.preferences?.avoidChars?.length ? `- 피할 글자: ${input.preferences.avoidChars.join(', ')}` : ''}

## 이름 생성 프로세스 (반드시 이 순서로)
1. 먼저 한글 이름을 정합니다 — 한국인이 일상에서 "OO아~", "OO이~"로 자연스럽게 부를 수 있는 이름
2. 그 한글 음(音)에 맞는 한자를 배정합니다 — 사주 보완 오행과 의미를 고려
3. 성씨와 결합하여 전체 이름을 소리내어 읽어봅니다 — 어색하면 교체

## 한자 선택 기준 (자원오행 우선)
- ★ 자원오행(한자 의미 기반 오행)이 용신(${ELEMENT_KO[baseSaju.lackingElement]})에 해당하는 한자를 최우선 선택
- 용신 직접 보완 한자 (1순위): ${getJawonRecommendation(baseSaju.lackingElement, input.gender)}
- 용신을 생하는 한자 (2순위): ${getJawonRecommendation(complementElement, input.gender)}
- 한국 작명에서 널리 쓰이는 한자를 우선 선택 (예: 俊, 賢, 恩, 瑞, 秀, 智, 善, 美, 英, 浩, 泰, 民, 宇 등)
- 음양 밸런스: 이름 전체가 음양이 조화를 이루도록 선택
- 수리격: 원격(元格)·형격(亨格)·이격(利格)·정격(貞格) 중 길격(吉格) 위주
- ⚠️ 불용한자 절대 금지: 死, 鬼, 病, 凶, 殺, 亡, 滅, 棄, 孤, 寡, 奴, 罪, 惡, 毒 등 부정적 의미 한자

## 자가 검증 체크리스트 (생성 후 반드시 확인)
- [ ] 이름이 한국 유치원/학교에서 자연스럽게 불릴 수 있는가?
- [ ] 중국어 병음(pinyin) 느낌이 나지 않는가?
- [ ] 성씨 + 이름 전체를 소리내어 읽었을 때 어색하지 않은가?
- [ ] 위 레퍼런스 이름들과 비슷한 감각인가?

## reasonShort 작성 지침
- 선택한 한자가 왜 이 사주에 맞는지 오행과 연결하여 1~2문장으로 설명
- 음양 밸런스나 수리격 특징 한 가지 포함
- 따뜻하고 희망적인 어조 유지

아래 형식의 JSON 배열로만 답변하세요. 배열([])로 시작하고 배열로 끝나야 합니다. 설명·마크다운·코드블록 없이 순수 JSON만:
[
  {"name": "서준", "hanja": "瑞俊", "reasonShort": "瑞(상서로울 서)는 ${ELEMENT_KO[complementElement]} 기운을 보완하며, 俊(준걸 준)과 함께 밝고 빼어난 인재의 기운을 담았습니다.", "sajuScore": 88},
  {"name": "하윤", "hanja": "夏潤", "reasonShort": "潤(윤택할 윤)이 사주의 수 기운을 채워 균형을 이루며, 따뜻한 여름의 생명력을 품고 있습니다.", "sajuScore": 85}
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
    const response = await callLLM(systemPrompt, userPrompt, { temperature: 0.7, maxTokens: 1500 });
    const raw = await parseLLMResponse(response);
    let validated = validateAndCorrectNames(raw.slice(0, 12), complementElement);

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
