/**
 * 불용한자(不用漢字) 필터
 *
 * 작명에 사용하면 안 되는 한자 목록.
 * 법적으로 사용 가능하더라도 전문 작명사가 피하는 글자들.
 *
 * 분류 기준:
 * 1. 의미 부정: 죽음, 질병, 고독, 패배 등 부정적 의미
 * 2. 음가 부정: 한국어 발음으로 부정적 연상
 * 3. 사회적 기피: 욕설 연상, 놀림감, 행정 불편
 *
 * 출처:
 * - 철학캠프 불용한자 목록 (hanname.com)
 * - namebest.co.kr 불용한자 해설
 * - 전문 작명사 공통 제외 목록
 */

export interface BulyongEntry {
  hanja: string;
  reading: string;
  reason: string;        // 불용 사유
  category: 'meaning' | 'sound' | 'social'; // 분류
  severity: 'hard' | 'soft'; // hard=절대 불가, soft=가급적 피함
}

export const BULYONG_HANJA: BulyongEntry[] = [
  // ═══ 의미 부정 (meaning) — 절대 불가 ═══
  { hanja: '死', reading: '사', reason: '죽음', category: 'meaning', severity: 'hard' },
  { hanja: '鬼', reading: '귀', reason: '귀신', category: 'meaning', severity: 'hard' },
  { hanja: '病', reading: '병', reason: '질병', category: 'meaning', severity: 'hard' },
  { hanja: '凶', reading: '흉', reason: '흉함/재앙', category: 'meaning', severity: 'hard' },
  { hanja: '殺', reading: '살', reason: '죽이다', category: 'meaning', severity: 'hard' },
  { hanja: '亡', reading: '망', reason: '망하다/죽다', category: 'meaning', severity: 'hard' },
  { hanja: '滅', reading: '멸', reason: '멸망하다', category: 'meaning', severity: 'hard' },
  { hanja: '棄', reading: '기', reason: '버리다', category: 'meaning', severity: 'hard' },
  { hanja: '孤', reading: '고', reason: '외롭다/고아', category: 'meaning', severity: 'hard' },
  { hanja: '寡', reading: '과', reason: '과부/적다', category: 'meaning', severity: 'hard' },
  { hanja: '奴', reading: '노', reason: '종/노비', category: 'meaning', severity: 'hard' },
  { hanja: '妾', reading: '첩', reason: '첩', category: 'meaning', severity: 'hard' },
  { hanja: '罪', reading: '죄', reason: '죄', category: 'meaning', severity: 'hard' },
  { hanja: '惡', reading: '악', reason: '악하다', category: 'meaning', severity: 'hard' },
  { hanja: '毒', reading: '독', reason: '독', category: 'meaning', severity: 'hard' },
  { hanja: '賊', reading: '적', reason: '도적', category: 'meaning', severity: 'hard' },
  { hanja: '喪', reading: '상', reason: '죽음/상복', category: 'meaning', severity: 'hard' },
  { hanja: '墓', reading: '묘', reason: '무덤', category: 'meaning', severity: 'hard' },
  { hanja: '哀', reading: '애', reason: '슬프다', category: 'meaning', severity: 'hard' },
  { hanja: '悲', reading: '비', reason: '슬프다', category: 'meaning', severity: 'hard' },
  { hanja: '怨', reading: '원', reason: '원망', category: 'meaning', severity: 'hard' },
  { hanja: '恨', reading: '한', reason: '한탄/원한', category: 'meaning', severity: 'hard' },
  { hanja: '苦', reading: '고', reason: '괴롭다', category: 'meaning', severity: 'hard' },
  { hanja: '困', reading: '곤', reason: '곤란하다', category: 'meaning', severity: 'hard' },
  { hanja: '厄', reading: '액', reason: '재앙/액운', category: 'meaning', severity: 'hard' },
  { hanja: '災', reading: '재', reason: '재난', category: 'meaning', severity: 'hard' },
  { hanja: '禍', reading: '화', reason: '재앙', category: 'meaning', severity: 'hard' },
  { hanja: '敗', reading: '패', reason: '패하다', category: 'meaning', severity: 'hard' },
  { hanja: '破', reading: '파', reason: '깨뜨리다', category: 'meaning', severity: 'hard' },
  { hanja: '窮', reading: '궁', reason: '궁하다/가난', category: 'meaning', severity: 'hard' },
  { hanja: '貧', reading: '빈', reason: '가난하다', category: 'meaning', severity: 'hard' },
  { hanja: '衰', reading: '쇠', reason: '쇠하다', category: 'meaning', severity: 'hard' },
  { hanja: '暗', reading: '암', reason: '어둡다', category: 'meaning', severity: 'hard' },
  { hanja: '闇', reading: '암', reason: '어둡다', category: 'meaning', severity: 'hard' },
  { hanja: '盲', reading: '맹', reason: '눈멀다', category: 'meaning', severity: 'hard' },
  { hanja: '啞', reading: '아', reason: '벙어리', category: 'meaning', severity: 'hard' },
  { hanja: '瘋', reading: '풍', reason: '미치다/광병', category: 'meaning', severity: 'hard' },

  // ═══ 의미 부정 — 가급적 피함 ═══
  { hanja: '末', reading: '말', reason: '끝/마지막', category: 'meaning', severity: 'soft' },
  { hanja: '沒', reading: '몰', reason: '빠지다/죽다', category: 'meaning', severity: 'soft' },
  { hanja: '離', reading: '리', reason: '떠나다/이별', category: 'meaning', severity: 'soft' },
  { hanja: '散', reading: '산', reason: '흩어지다', category: 'meaning', severity: 'soft' },
  { hanja: '退', reading: '퇴', reason: '물러나다', category: 'meaning', severity: 'soft' },
  { hanja: '落', reading: '락', reason: '떨어지다', category: 'meaning', severity: 'soft' },
  { hanja: '消', reading: '소', reason: '사라지다', category: 'meaning', severity: 'soft' },
  { hanja: '虛', reading: '허', reason: '비다/헛되다', category: 'meaning', severity: 'soft' },
  { hanja: '空', reading: '공', reason: '비다', category: 'meaning', severity: 'soft' },
  { hanja: '薄', reading: '박', reason: '얇다/박정', category: 'meaning', severity: 'soft' },
  { hanja: '弱', reading: '약', reason: '약하다', category: 'meaning', severity: 'soft' },
  { hanja: '遲', reading: '지', reason: '늦다', category: 'meaning', severity: 'soft' },
  { hanja: '鈍', reading: '둔', reason: '둔하다', category: 'meaning', severity: 'soft' },

  // ═══ 음가 부정 (sound) ═══
  { hanja: '得', reading: '득', reason: '"득" 발음이 속어 연상', category: 'sound', severity: 'soft' },
  { hanja: '年', reading: '년', reason: '"년" 비속어 연상', category: 'sound', severity: 'hard' },
  { hanja: '極', reading: '극', reason: '"극" 부정적 어감', category: 'sound', severity: 'soft' },
  { hanja: '吸', reading: '흡', reason: '"흡" 불쾌한 어감', category: 'sound', severity: 'soft' },
  { hanja: '糞', reading: '분', reason: '대변', category: 'sound', severity: 'hard' },

  // ═══ 사회적 기피 (social) ═══
  { hanja: '姦', reading: '간', reason: '간음/간사', category: 'social', severity: 'hard' },
  { hanja: '淫', reading: '음', reason: '음란', category: 'social', severity: 'hard' },
  { hanja: '妓', reading: '기', reason: '기생', category: 'social', severity: 'hard' },
  { hanja: '賤', reading: '천', reason: '천하다', category: 'social', severity: 'hard' },
  { hanja: '卑', reading: '비', reason: '낮다/비천', category: 'social', severity: 'hard' },
  { hanja: '醜', reading: '추', reason: '추하다', category: 'social', severity: 'hard' },
  { hanja: '愚', reading: '우', reason: '어리석다', category: 'social', severity: 'soft' },
  { hanja: '狂', reading: '광', reason: '미치다', category: 'social', severity: 'hard' },
  { hanja: '乞', reading: '걸', reason: '빌다/거지', category: 'social', severity: 'hard' },
];

// 빠른 검색을 위한 Set
const BULYONG_HARD_SET = new Set(
  BULYONG_HANJA.filter((b) => b.severity === 'hard').map((b) => b.hanja)
);
const BULYONG_ALL_SET = new Set(
  BULYONG_HANJA.map((b) => b.hanja)
);

/**
 * 한자가 불용한자인지 확인
 * @returns null이면 안전, BulyongEntry면 불용 사유 포함
 */
export function checkBulyong(hanja: string): BulyongEntry | null {
  return BULYONG_HANJA.find((b) => b.hanja === hanja) ?? null;
}

/**
 * 이름 전체의 불용한자 검사
 * @returns hard 불용이 하나라도 있으면 score=0, soft만 있으면 감점
 */
export function validateBulyong(hanjaChars: string[]): {
  passed: boolean;
  issues: BulyongEntry[];
  score: number; // 0~100
} {
  const issues = hanjaChars
    .map((ch) => checkBulyong(ch))
    .filter((b): b is BulyongEntry => b !== null);

  const hasHard = issues.some((b) => b.severity === 'hard');
  const softCount = issues.filter((b) => b.severity === 'soft').length;

  if (hasHard) {
    return { passed: false, issues, score: 0 };
  }
  if (softCount > 0) {
    return { passed: true, issues, score: Math.max(50, 100 - softCount * 25) };
  }
  return { passed: true, issues: [], score: 100 };
}

/**
 * 불용한자 빠른 체크 (boolean)
 */
export function isBulyongHard(hanja: string): boolean {
  return BULYONG_HARD_SET.has(hanja);
}

export function isBulyongAny(hanja: string): boolean {
  return BULYONG_ALL_SET.has(hanja);
}
