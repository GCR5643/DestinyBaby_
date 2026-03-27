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
  const allHanjaChars = hanjaIsNameOnly ? Array.from(hanja) : Array.from(hanja);

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

  const systemPrompt = `당신은 전통 명리학과 작명학의 전문가입니다.
이름의 한자·획수·음양오행·수리격·발음을 종합적으로 분석하여
상세하고 전문적인 이름 분석 리포트를 작성합니다.
반드시 JSON 형식으로만 답변하세요. 다른 텍스트는 절대 포함하지 마세요.

${TONE_SYSTEM}`;

  const userPrompt = `이름 "${name}" (${hanja})에 대한 상세 분석 리포트를 작성해주세요.

## 사주 정보
- 아기 일간(日干, 본질 기운): ${dayMasterKo}
- 아기 부족 오행: ${lackingKo}
- 아기 강한 오행: ${sajuResult.strongElements.map(e => ELEMENT_KO[e] ?? e).join(', ')}
- 부(父) 주요 오행: ${p1MainKo}
${p2MainKo ? `- 모(母) 주요 오행: ${p2MainKo}` : ''}

## 획수 분석 (5격 기준)
- 총획수: ${strokeAnalysis.totalStrokes}획
- 수리격: ${gradeInfo}
- 행운 점수(5격 기반): ${strokeAnalysis.luckScore}점

## 분석 지침
1. yinYangFiveElements: 이름 한자의 오행 구성과 아기 사주 부족 오행 보완 여부를 구체적으로 설명
2. pronunciationAnalysis: 초성 조합의 조화, 모음 배열의 유연성 분석
3. meaningBreakdown: 각 한자의 정확한 의미와 사주와의 연관성 설명
4. sajuFitScore: 0~100점, 사주와의 적합도 (오행 보완 + 음양 균형 + 수리격 종합)
5. parentCompatibility: 부모 오행과의 상생 관계 기반 점수
6. overallComment: 장점 → 보완점 → 축복 순서로 3~4문장, 따뜻한 마무리 포함

JSON으로만 답변:
{
  "yinYangFiveElements": {
    "elements": ["fire", "water"],
    "balance": "음양 균형 설명",
    "recommendation": "오행 보완 관계 설명 (예: 부족한 수(水) 기운을 보완하여 균형을 이룹니다)"
  },
  "pronunciationAnalysis": {
    "harmony": 88,
    "initialConsonants": ["ㅈ", "ㅇ"],
    "comment": "초성과 모음 조합의 발음 조화 설명 2문장"
  },
  "meaningBreakdown": [
    {"char": "지", "hanja": "智", "meaning": "지혜로울 지 — 총명하고 사려 깊은 성품을 의미합니다"}
  ],
  "sajuFitScore": 88,
  "parentCompatibility": {"mom": 85, "dad": 88, "combined": 86},
  "overallComment": "장점 설명. 보완점 또는 특징 설명. 아이의 미래를 축복하는 따뜻한 마무리 문장."
}`;

  try {
    const response = await callLLM(systemPrompt, userPrompt, { temperature: 0.7, maxTokens: 1800 });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid format');

    const analysisData = JSON.parse(jsonMatch[0]) as {
      yinYangFiveElements?: { elements: Element[]; balance: string; recommendation: string };
      pronunciationAnalysis?: { harmony: number; initialConsonants: string[]; comment: string };
      meaningBreakdown?: { char: string; hanja: string; meaning: string }[];
      sajuFitScore?: number;
      parentCompatibility?: { mom: number; dad: number; combined: number };
      overallComment?: string;
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
