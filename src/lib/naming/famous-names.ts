/**
 * 이름이 쓰인 유명인/매체 검색
 * LLM 기반으로 한국어 이름에 대한 유명인, 드라마/영화 캐릭터, 역사적 인물 정보를 생성
 */

import { callLLM } from '@/lib/llm/llm-client';

export interface FamousPerson {
  name: string;           // 전체 이름 (예: 김지우)
  category: 'drama' | 'movie' | 'novel' | 'celebrity' | 'sports' | 'history' | 'science' | 'politics' | 'cartoon' | 'music';
  categoryLabel: string;  // 한국어 카테고리명
  description: string;    // 한줄 설명
  work?: string;          // 작품명 (드라마, 영화 등)
  actor?: string;         // 배우명 (드라마/영화의 경우)
  era?: string;           // 시대/년도
  funFact?: string;       // 재미있는 한줄 사실
}

export interface FamousNamesResult {
  givenName: string;      // 검색한 이름 (예: 지우)
  totalFound: number;
  people: FamousPerson[];
  funComment: string;     // 재미있는 종합 코멘트
}

const CATEGORY_LABELS: Record<string, string> = {
  drama: '드라마',
  movie: '영화',
  novel: '소설/웹툰',
  celebrity: '연예인',
  sports: '스포츠',
  history: '역사',
  science: '과학/기술',
  politics: '정치/사회',
  cartoon: '만화/애니',
  music: '음악',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  drama: '📺',
  movie: '🎬',
  novel: '📚',
  celebrity: '⭐',
  sports: '⚽',
  history: '🏛️',
  science: '🔬',
  politics: '🏢',
  cartoon: '🎨',
  music: '🎵',
};

export { CATEGORY_LABELS, CATEGORY_EMOJIS };

export async function searchFamousNames(givenName: string): Promise<FamousNamesResult> {
  const systemPrompt = `당신은 한국 이름에 대한 유명인/매체 데이터베이스 전문가입니다.
주어진 이름(given name)을 가진 유명인, 드라마/영화 캐릭터, 역사적 인물, 과학자, 정치인, 스포츠 선수 등을 찾아주세요.

규칙:
- 실제로 존재하는 인물/캐릭터만 답변 (허구 금지)
- 한국 이름이 주어지면 한국 인물 위주 + 해외 유명인도 포함 가능
- 각 인물에 대해 간결하고 재미있는 설명
- 드라마/영화 캐릭터의 경우 반드시 배우명과 작품명 포함
- 부정적인 인물(범죄자 등)은 제외
- 최소 3명, 최대 8명 추천
- 다양한 카테고리에서 골고루 선정

반드시 아래 JSON 형식으로만 답변하세요. 다른 텍스트 없이 JSON만:
{
  "people": [
    {
      "name": "성+이름 (예: 김지우)",
      "category": "drama|movie|novel|celebrity|sports|history|science|politics|cartoon|music",
      "description": "한줄 설명",
      "work": "작품명 (해당시)",
      "actor": "배우명 (해당시)",
      "era": "활동 시기",
      "funFact": "재미있는 한줄 사실"
    }
  ],
  "funComment": "이 이름에 대한 재미있는 종합 코멘트 (1-2문장)"
}`;

  const userPrompt = `이름: "${givenName}"

이 이름(given name)을 가진 유명한 인물이나 캐릭터를 찾아주세요. 성은 상관없이 이름 부분만 같으면 됩니다.
예를 들어 "지우"라면 김지우, 박지우, 최지우 등 모두 포함됩니다.`;

  try {
    const raw = await callLLM(systemPrompt, userPrompt, {
      temperature: 0.3,
      maxTokens: 1500,
    });

    // JSON 파싱 (markdown 코드블록 제거)
    const jsonStr = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    const people: FamousPerson[] = (parsed.people || []).map((p: Record<string, string>) => ({
      name: p.name || '',
      category: p.category || 'celebrity',
      categoryLabel: CATEGORY_LABELS[p.category] || p.category || '기타',
      description: p.description || '',
      work: p.work || undefined,
      actor: p.actor || undefined,
      era: p.era || undefined,
      funFact: p.funFact || undefined,
    }));

    return {
      givenName,
      totalFound: people.length,
      people,
      funComment: parsed.funComment || `"${givenName}"는 다양한 분야에서 빛나는 이름이에요!`,
    };
  } catch (err) {
    console.error('[famous-names] LLM 호출 실패:', err instanceof Error ? err.message : err);
    // 실패 시 빈 결과 반환 (기능 자체가 부가적이므로 에러 전파 안 함)
    return {
      givenName,
      totalFound: 0,
      people: [],
      funComment: `"${givenName}" 이름의 유명인 정보를 불러오는 중 오류가 발생했어요.`,
    };
  }
}
