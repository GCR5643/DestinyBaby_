import type { NamingReport, SajuResult, StrokeAnalysis, Element } from '@/types';
import { callLLM } from '@/lib/llm/llm-client';
import { getHanjaStrokes } from '@/lib/naming/hanja-strokes';
import { analyzeEumyang } from '@/lib/naming/eumyang';
import { analyzePronunciationOheng } from '@/lib/naming/pronunciation-oheng';
import { calculateFiveGyeok } from '@/lib/naming/five-gyeok';
import { analyzeJawonOheng } from '@/lib/naming/jawon-oheng';
import { validateBulyong } from '@/lib/naming/bulyong-hanja';

// 오행 한국어 이름
const ELEMENT_KO: Record<string, string> = {
  wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
};

// 한글 성씨 → 강희자전 기준 한자 획수 매핑 (상위 20개 성씨)
const COMMON_SURNAME_STROKES: Record<string, number> = {
  '김': 8,  // 金
  '이': 7,  // 李
  '박': 6,  // 朴
  '최': 12, // 崔
  '정': 13, // 鄭
  '강': 11, // 姜
  '조': 10, // 趙
  '윤': 12, // 尹 (강희자전 기준)
  '장': 11, // 張
  '임': 6,  // 林
  '한': 17, // 韓
  '오': 4,  // 吳
  '서': 10, // 徐
  '신': 13, // 申
  '권': 22, // 權
  '황': 12, // 黃
  '안': 6,  // 安
  '송': 7,  // 宋
  '류': 10, // 柳
  '홍': 10, // 洪
};

const TONE_SYSTEM = `## 톤앤매너 규칙
1. 부정적 표현 금지: "나쁘다", "흉하다", "불길하다" → "보완이 필요합니다", "주의가 필요합니다"로 대체
2. 단정 금지: "반드시 ~합니다" → "~하는 경향이 있습니다", "~할 가능성이 높습니다"로 표현
3. 건강·질병 관련 예측 절대 금지
4. 모든 분석은 장점 → 보완점 → 조언 순서로 구성
5. 부모와 아이 모두에게 따뜻하고 희망적인 어조 유지

## 절대 금지 표현
- 건강 문제·사고·재난 예측 또는 경고
- 이혼·불행한 결혼 예측
- 재물운 실패 단정
- "전생", "업보" 등 미신적 표현
- 특정 직업이나 진로 단정`;

/**
 * 한자 전체 이름(성+이름)과 한글 성씨를 받아 5격 기반 StrokeAnalysis를 반환합니다.
 * - 성씨 한자가 있으면 getHanjaStrokes로 획수 계산
 * - 없으면 한글 성씨 → COMMON_SURNAME_STROKES 매핑 사용
 */
function calculateStrokes(
  hanja: string,
  surnameHangul: string,
  surnameHanja?: string,
): StrokeAnalysis {
  const hanjaChars = hanja.split('');

  // 성씨 획수: 한자가 있으면 첫 글자 획수, 없으면 한글 매핑
  const surnameStrokes =
    surnameHanja
      ? getHanjaStrokes(surnameHanja.charAt(0))
      : (COMMON_SURNAME_STROKES[surnameHangul] ?? 8);

  // 이름 부분 한자: surnameHanja가 없으면 hanja 전체가 이름 한자
  const nameHanjaChars = surnameHanja ? hanjaChars.slice(1) : hanjaChars;
  const nameStrokesArr = nameHanjaChars.map(c => getHanjaStrokes(c));

  const gyeok = calculateFiveGyeok(
    surnameStrokes,
    nameStrokesArr.length > 0 ? nameStrokesArr : [1],
  );

  const totalStrokes = surnameStrokes + nameStrokesArr.reduce((a, b) => a + b, 0);

  return {
    totalStrokes,
    heavenGrade: gyeok.천격.value,
    humanGrade:  gyeok.인격.value,
    earthGrade:  gyeok.지격.value,
    outerGrade:  gyeok.외격.value,
    totalGrade:  gyeok.총격.value,
    luckScore:   gyeok.totalScore,
  };
}

export async function analyzeName(
  name: string,
  hanja: string,
  sajuResult: SajuResult,
  parentSaju1: SajuResult,
  parentSaju2?: SajuResult,
  surname?: string,
): Promise<NamingReport> {
  // 성씨/이름 분리: surname이 명시되면 그걸 사용, 아니면 name 첫 글자
  const surnameHangul = surname ?? name.charAt(0);
  const nameHangul = surname ? name : name.slice(1);

  // hanja가 이름 한자만인지(성씨 제외), 성씨 포함인지 판단
  // hanja 길이 == nameHangul 길이 → 이름 한자만 (성씨 미포함)
  // hanja 길이 == name 길이 → 성씨 포함
  const hanjaIsNameOnly = hanja.length === nameHangul.length;
  const nameHanjaChars = hanjaIsNameOnly ? Array.from(hanja) : Array.from(hanja).slice(1);

  const strokeAnalysis = calculateStrokes(
    hanjaIsNameOnly ? hanja : hanja, // 5격 계산용
    surnameHangul,
    hanjaIsNameOnly ? undefined : hanja.charAt(0), // 성씨 한자
  );

  // 음양 배합 분석
  const surnameStrokeCount = COMMON_SURNAME_STROKES[surnameHangul] ?? 8;
  const nameStrokeArr = nameHanjaChars.map(c => getHanjaStrokes(c));
  const eumyangResult = analyzeEumyang(surnameStrokeCount, nameStrokeArr);

  // 발음 오행 분석
  const pronOhengResult = analyzePronunciationOheng(surnameHangul, nameHangul);

  // 자원오행 분석: 이름 한자만 (성씨 제외)
  const jawonResult = analyzeJawonOheng(nameHanjaChars, sajuResult.lackingElement);

  // 불용한자 검사: 이름 한자만 검사
  const bulyongResult = validateBulyong(nameHanjaChars);

  // ──── 전문가 기준 종합 점수 (가중치 재조정) ────
  // 출처: 복수 전문 작명사 공통 기준
  // 자원오행(40%) > 발음오행(25%) > 수리오행(20%) > 음양(10%) > 불용한자(5%)
  const expertWeightedScore = bulyongResult.passed
    ? Math.round(
        jawonResult.score * 0.40 +
        pronOhengResult.score * 0.25 +
        strokeAnalysis.luckScore * 0.20 +
        eumyangResult.score * 0.10 +
        bulyongResult.score * 0.05
      )
    : 0; // 불용한자 hard 위반 시 0점

  // 수리격 정보 (5격 기준 라벨)
  const gradeInfo = [
    { label: '천격(天格)', value: strokeAnalysis.heavenGrade },
    { label: '인격(人格)', value: strokeAnalysis.humanGrade },
    { label: '지격(地格)', value: strokeAnalysis.earthGrade },
    { label: '외격(外格)', value: strokeAnalysis.outerGrade },
    { label: '총격(總格)', value: strokeAnalysis.totalGrade },
  ]
    .map(g => `${g.label}: ${g.value}획`)
    .join(', ');

  const dayMasterKo = ELEMENT_KO[sajuResult.dayPillar.element] ?? sajuResult.dayPillar.element;
  const lackingKo = ELEMENT_KO[sajuResult.lackingElement] ?? sajuResult.lackingElement;
  const p1MainKo = ELEMENT_KO[parentSaju1.mainElement] ?? parentSaju1.mainElement;
  const p2MainKo = parentSaju2 ? (ELEMENT_KO[parentSaju2.mainElement] ?? parentSaju2.mainElement) : null;

  const systemPrompt = `당신은 30년 경력의 전통 명리학·작명학 대가이자 육아 전문 상담사입니다.
이름의 한자·획수·음양오행·수리격·발음을 종합적으로 분석하여
부모가 돈을 내고 읽을 만한, 상세하고 깊이 있는 프리미엄 이름 분석 리포트를 작성합니다.

중요: 각 필드마다 충분한 분량으로 작성하세요. 한 문장짜리 설명은 절대 안 됩니다.
부모가 "이 리포트를 읽으니 우리 아이의 이름에 대해 깊이 이해하게 되었다"고 느낄 수 있도록 풍성하게 서술하세요.

반드시 JSON 형식으로만 답변하세요. 다른 텍스트는 절대 포함하지 마세요.

${TONE_SYSTEM}`;

  const strongElementsKo = sajuResult.strongElements.map(e => ELEMENT_KO[e] ?? e).join(', ');
  const weakElementsKo = sajuResult.weakElements.map(e => ELEMENT_KO[e] ?? e).join(', ');

  const userPrompt = `이름 "${name}" (${hanja})에 대한 프리미엄 상세 분석 리포트를 작성해주세요.

## 사주 정보
- 아기 일간(日干, 본질 기운): ${dayMasterKo}
- 아기 부족 오행(용신): ${lackingKo}
- 아기 강한 오행: ${strongElementsKo}
- 아기 약한 오행: ${weakElementsKo}
- 부(父) 주요 오행: ${p1MainKo}
${p2MainKo ? `- 모(母) 주요 오행: ${p2MainKo}` : ''}

## 획수 분석 (5격 기준)
- 총획수: ${strokeAnalysis.totalStrokes}획
- 수리격: ${gradeInfo}
- 행운 점수(5격 기반): ${strokeAnalysis.luckScore}점

## 분석 지침 — 각 필드를 풍성하게 작성하세요

### 기존 필드 (더 깊이 있게)
1. yinYangFiveElements: 오행 구성과 사주 부족 오행 보완 관계를 3-4문장으로 상세 설명
2. pronunciationAnalysis: 초성·중성·종성 조합의 음운 조화를 2-3문장으로 분석
3. meaningBreakdown: 각 한자의 의미를 2-3문장으로 풍성하게 (뜻풀이 + 사주와의 연관)
4. sajuFitScore: 0~100점
5. parentCompatibility: 부모 오행과의 상생 관계 기반 점수
6. overallComment: 장점 → 보완점 → 이 이름의 운명적 의미 → 축복 순서로 6~8문장, 프리미엄 리포트답게 충실하게

### 신규 확장 필드 (프리미엄 리포트의 핵심)
7. sajuNarrative: 아이의 사주 원국(原局) 해석. 일간 ${dayMasterKo}의 성격, 강한 오행(${strongElementsKo})이 주는 천부적 재능, 약한 오행(${weakElementsKo})의 보완 필요성을 5~8문장으로 서술. 전문 용어는 쉽게 풀어서 설명하되, 깊이감을 유지.
8. yongshinAnalysis: 용신(用神) 분석. 이 아이에게 왜 ${lackingKo} 기운이 필요한지, 용신이 보완되면 아이의 삶에 어떤 긍정적 변화가 오는지 3~5문장.
9. nameEnergyStory: 이름 "${name}"(${hanja})이 아이의 사주를 어떻게 보완하는지 원리를 이야기처럼 서술. 한자의 오행, 획수의 수리, 발음의 기운이 어떻게 사주와 맞물리는지 5~8문장.
10. characterDeepDive: 각 한자의 심층 분석. 각 글자에 대해:
    - meaning: 한자의 뜻풀이 (2-3문장)
    - etymology: 한자의 유래와 원래 형태 설명 (2-3문장, 예: "이 글자는 원래 ~를 뜻하는 상형문자에서…")
    - culturalNote: 이 한자가 한국·동아시아 문화에서 갖는 의미, 명언, 유명인 이름에 쓰인 사례 등 (2-3문장)
11. parentCompatibilityNarrative: 엄마(${p2MainKo ?? '미상'})·아빠(${p1MainKo}) 각각과 아이의 오행 관계를 서사적으로 해석. 상생·상극 관계, 부모가 아이에게 해줄 수 있는 역할 등 4~6문장.
12. blessingLetter: 이 아이만을 위한 축복 편지. "${name}에게"로 시작, 아이의 사주적 특성과 이름의 의미를 엮어 6~10문장의 감동적인 편지. 부모가 읽고 눈물 흘릴 수 있을 정도로 따뜻하게.
13. personalizedMilestones: 사주 기반 시기별 인생 이정표 4개. 각 항목에 age(시기), icon(이모지 1개), title(제목), description(이 아이의 사주에 맞는 구체적 조언 2-3문장). 반드시 이 아이의 오행 특성에 맞춰 개인화.

JSON으로만 답변:
{
  "yinYangFiveElements": {
    "elements": ["fire", "water"],
    "balance": "음양 균형에 대한 상세 설명 3-4문장",
    "recommendation": "오행 보완 관계 설명 3-4문장"
  },
  "pronunciationAnalysis": {
    "harmony": 88,
    "initialConsonants": ["ㅈ", "ㅇ"],
    "comment": "발음 조화 분석 2-3문장"
  },
  "meaningBreakdown": [
    {"char": "지", "hanja": "智", "meaning": "지혜로울 지 — 풍성한 뜻풀이 2-3문장"}
  ],
  "sajuFitScore": 88,
  "parentCompatibility": {"mom": 85, "dad": 88, "combined": 86},
  "overallComment": "프리미엄 종합 소견 6-8문장",
  "sajuNarrative": "사주 원국 해석 5-8문장",
  "yongshinAnalysis": "용신 분석 3-5문장",
  "nameEnergyStory": "이름-사주 연결 서사 5-8문장",
  "characterDeepDive": [
    {
      "char": "지", "hanja": "智",
      "meaning": "뜻풀이 2-3문장",
      "etymology": "한자 유래 2-3문장",
      "culturalNote": "문화적 의미 2-3문장"
    }
  ],
  "parentCompatibilityNarrative": "부모 궁합 서사 4-6문장",
  "blessingLetter": "축복 편지 6-10문장",
  "personalizedMilestones": [
    {"age": "유아기 (0~7세)", "icon": "🌱", "title": "제목", "description": "개인화된 조언 2-3문장"}
  ]
}`;

  try {
    const response = await callLLM(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: 4000,
      fetchTimeoutMs: 25000,   // 프리미엄 리포트는 긴 응답 필요
      totalBudgetMs: 50000,    // 총 50초 예산
    });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid format');

    const analysisData = JSON.parse(jsonMatch[0]) as {
      yinYangFiveElements?: { elements: Element[]; balance: string; recommendation: string };
      pronunciationAnalysis?: { harmony: number; initialConsonants: string[]; comment: string };
      meaningBreakdown?: { char: string; hanja: string; meaning: string }[];
      sajuFitScore?: number;
      parentCompatibility?: { mom: number; dad: number; combined: number };
      overallComment?: string;
      // 확장 필드
      sajuNarrative?: string;
      yongshinAnalysis?: string;
      nameEnergyStory?: string;
      characterDeepDive?: { char: string; hanja: string; meaning: string; etymology: string; culturalNote: string }[];
      parentCompatibilityNarrative?: string;
      blessingLetter?: string;
      personalizedMilestones?: { age: string; icon: string; title: string; description: string }[];
    };

    return {
      name,
      hanja,
      strokeAnalysis,
      yinYangFiveElements: analysisData.yinYangFiveElements ?? {
        elements: [sajuResult.mainElement],
        balance: '조화로운',
        recommendation: `${lackingKo} 기운을 보완하여 사주의 균형을 이룹니다`,
      },
      pronunciationAnalysis: analysisData.pronunciationAnalysis ?? {
        harmony: 85,
        initialConsonants: [],
        comment: '발음이 자연스럽고 부르기 좋은 이름입니다',
      },
      meaningBreakdown: analysisData.meaningBreakdown ??
        name.split('').map((c, i) => ({
          char: c,
          hanja: hanja[i] ?? c,
          meaning: '아름다운 의미를 담고 있습니다',
        })),
      sajuFitScore: analysisData.sajuFitScore ?? 85,
      parentCompatibility: analysisData.parentCompatibility ?? { mom: 80, dad: 82, combined: 81 },
      overallComment: analysisData.overallComment ??
        `"${name}"은 ${lackingKo} 기운을 보완하여 사주의 균형을 잘 맞추어주는 아름다운 이름입니다. 이 이름과 함께 아이가 건강하고 행복하게 자라나길 바랍니다.`,
      // 확장 필드
      sajuNarrative: analysisData.sajuNarrative,
      yongshinAnalysis: analysisData.yongshinAnalysis,
      nameEnergyStory: analysisData.nameEnergyStory,
      characterDeepDive: analysisData.characterDeepDive,
      parentCompatibilityNarrative: analysisData.parentCompatibilityNarrative,
      blessingLetter: analysisData.blessingLetter,
      personalizedMilestones: analysisData.personalizedMilestones,
      eumyangAnalysis: eumyangResult,
      pronunciationOheng: pronOhengResult,
      jawonOheng: jawonResult,
      bulyongCheck: bulyongResult,
      expertScore: expertWeightedScore,
    };
  } catch {
    return {
      name,
      hanja,
      strokeAnalysis,
      yinYangFiveElements: {
        elements: [sajuResult.mainElement],
        balance: '균형잡힌',
        recommendation: `${lackingKo} 기운을 보완하여 오행의 균형을 이룹니다`,
      },
      pronunciationAnalysis: {
        harmony: 85,
        initialConsonants: [],
        comment: '발음이 부드럽고 조화롭습니다',
      },
      meaningBreakdown: name.split('').map((c, i) => ({
        char: c,
        hanja: hanja[i] ?? c,
        meaning: '좋은 의미를 담고 있습니다',
      })),
      sajuFitScore: 85,
      parentCompatibility: { mom: 82, dad: 84, combined: 83 },
      overallComment: `"${name}"은 사주의 ${lackingKo} 기운을 자연스럽게 보완해주는 아름다운 이름입니다. 이 이름과 함께 아이가 밝고 행복한 삶을 펼쳐나가길 진심으로 응원합니다.`,
      eumyangAnalysis: eumyangResult,
      pronunciationOheng: pronOhengResult,
      jawonOheng: jawonResult,
      bulyongCheck: bulyongResult,
      expertScore: expertWeightedScore,
    };
  }
}
