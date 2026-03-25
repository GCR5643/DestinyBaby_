// 81수리 길흉 테이블 - 전통 작명학 기준
// 강희자전 획수 기반 수리 길흉 판단

export type SuriLuck = '대길' | '길' | '반길' | '흉' | '대흉';

export interface SuriInfo {
  number: number;
  luck: SuriLuck;
  keyword: string;   // 2-4글자 키워드
  description: string; // 간단 설명
}

// 81수리 테이블 (전통 작명학 기준)
const SURI_81_TABLE: Record<number, SuriInfo> = {
  1:  { number: 1,  luck: '대길', keyword: '태초', description: '만물의 시작, 대업을 이룰 수' },
  2:  { number: 2,  luck: '흉',   keyword: '분리', description: '분리와 파멸의 수' },
  3:  { number: 3,  luck: '대길', keyword: '번영', description: '천지의 덕, 만물 생성' },
  4:  { number: 4,  luck: '대흉', keyword: '파괴', description: '불안정과 고난의 수' },
  5:  { number: 5,  luck: '대길', keyword: '복록', description: '건강과 복록의 수' },
  6:  { number: 6,  luck: '대길', keyword: '덕후', description: '하늘의 덕으로 성공' },
  7:  { number: 7,  luck: '길',   keyword: '독립', description: '독립 의지, 강인함' },
  8:  { number: 8,  luck: '길',   keyword: '발전', description: '의지가 강하고 발전' },
  9:  { number: 9,  luck: '흉',   keyword: '종극', description: '빈곤과 고난의 수' },
  10: { number: 10, luck: '흉',   keyword: '공허', description: '공허와 불안의 수' },
  11: { number: 11, luck: '대길', keyword: '신춘', description: '새 봄의 기운, 순탄' },
  12: { number: 12, luck: '흉',   keyword: '박약', description: '의지 박약, 고독' },
  13: { number: 13, luck: '대길', keyword: '지략', description: '지혜와 재능 풍부' },
  14: { number: 14, luck: '흉',   keyword: '이산', description: '이별과 고독의 수' },
  15: { number: 15, luck: '대길', keyword: '복수', description: '복과 수명의 수' },
  16: { number: 16, luck: '대길', keyword: '덕망', description: '덕망과 인자의 수' },
  17: { number: 17, luck: '길',   keyword: '권위', description: '강한 의지와 권위' },
  18: { number: 18, luck: '길',   keyword: '발전', description: '지혜와 발전의 수' },
  19: { number: 19, luck: '흉',   keyword: '고난', description: '고난과 장해의 수' },
  20: { number: 20, luck: '흉',   keyword: '허무', description: '공허와 허무의 수' },
  21: { number: 21, luck: '대길', keyword: '두령', description: '두령의 운, 지도자' },
  22: { number: 22, luck: '흉',   keyword: '중절', description: '중도 좌절의 수' },
  23: { number: 23, luck: '대길', keyword: '벽일', description: '태양의 기운, 번성' },
  24: { number: 24, luck: '대길', keyword: '축재', description: '재물 축적의 수' },
  25: { number: 25, luck: '길',   keyword: '영재', description: '재능과 특기의 수' },
  26: { number: 26, luck: '반길', keyword: '파란', description: '파란만장, 영웅호걸' },
  27: { number: 27, luck: '반길', keyword: '대인', description: '비판과 대립의 수' },
  28: { number: 28, luck: '흉',   keyword: '조난', description: '풍파와 조난의 수' },
  29: { number: 29, luck: '길',   keyword: '지략', description: '풍부한 지략과 성공' },
  30: { number: 30, luck: '반길', keyword: '부침', description: '부침이 있는 수' },
  31: { number: 31, luck: '대길', keyword: '흥가', description: '지혜와 인덕의 수' },
  32: { number: 32, luck: '대길', keyword: '요행', description: '행운과 기회의 수' },
  33: { number: 33, luck: '대길', keyword: '승천', description: '하늘로 오르는 수' },
  34: { number: 34, luck: '흉',   keyword: '파멸', description: '파란과 불운의 수' },
  35: { number: 35, luck: '길',   keyword: '평안', description: '평화와 안정의 수' },
  36: { number: 36, luck: '반길', keyword: '파란', description: '풍파를 겪는 수' },
  37: { number: 37, luck: '길',   keyword: '인덕', description: '인덕과 출세의 수' },
  38: { number: 38, luck: '반길', keyword: '문예', description: '학예에 뛰어남' },
  39: { number: 39, luck: '대길', keyword: '부귀', description: '부귀영화의 수' },
  40: { number: 40, luck: '반길', keyword: '부침', description: '지략은 있으나 부침' },
  41: { number: 41, luck: '대길', keyword: '고명', description: '덕과 명성의 수' },
  42: { number: 42, luck: '반길', keyword: '다재', description: '다재다능, 기복' },
  43: { number: 43, luck: '흉',   keyword: '산재', description: '산만과 낭비의 수' },
  44: { number: 44, luck: '흉',   keyword: '파괴', description: '파괴와 고통의 수' },
  45: { number: 45, luck: '대길', keyword: '순풍', description: '순풍에 돛을 단 수' },
  46: { number: 46, luck: '반길', keyword: '풍파', description: '풍파와 만난의 수' },
  47: { number: 47, luck: '대길', keyword: '권위', description: '꽃이 피는 수' },
  48: { number: 48, luck: '길',   keyword: '지략', description: '지략과 덕의 수' },
  49: { number: 49, luck: '반길', keyword: '변화', description: '변화가 많은 수' },
  50: { number: 50, luck: '반길', keyword: '부침', description: '성공과 실패의 반복' },
  51: { number: 51, luck: '반길', keyword: '성쇠', description: '성하고 쇠하는 수' },
  52: { number: 52, luck: '길',   keyword: '선견', description: '선견지명의 수' },
  53: { number: 53, luck: '반길', keyword: '내허', description: '겉은 화려 속은 빈' },
  54: { number: 54, luck: '흉',   keyword: '불구', description: '불완전한 수' },
  55: { number: 55, luck: '반길', keyword: '미달', description: '뜻은 크나 미달' },
  56: { number: 56, luck: '흉',   keyword: '한탄', description: '한탄과 불만의 수' },
  57: { number: 57, luck: '길',   keyword: '노력', description: '노력의 결실' },
  58: { number: 58, luck: '반길', keyword: '후길', description: '후에 길함이 옴' },
  59: { number: 59, luck: '흉',   keyword: '부족', description: '의지 부족의 수' },
  60: { number: 60, luck: '흉',   keyword: '암흑', description: '동요와 불안의 수' },
  61: { number: 61, luck: '길',   keyword: '번영', description: '명예와 재산의 수' },
  62: { number: 62, luck: '흉',   keyword: '쇠퇴', description: '쇠퇴와 쇠약의 수' },
  63: { number: 63, luck: '대길', keyword: '성취', description: '성취와 완성의 수' },
  64: { number: 64, luck: '흉',   keyword: '침체', description: '침체와 부진의 수' },
  65: { number: 65, luck: '대길', keyword: '순창', description: '순조로운 창달' },
  66: { number: 66, luck: '흉',   keyword: '실의', description: '진퇴 양난의 수' },
  67: { number: 67, luck: '길',   keyword: '달성', description: '천혜의 복록' },
  68: { number: 68, luck: '대길', keyword: '발명', description: '지혜와 발명의 수' },
  69: { number: 69, luck: '흉',   keyword: '종말', description: '정신적 고통의 수' },
  70: { number: 70, luck: '흉',   keyword: '공허', description: '적막과 공허의 수' },
  71: { number: 71, luck: '반길', keyword: '편중', description: '편중된 발전' },
  72: { number: 72, luck: '흉',   keyword: '후흉', description: '전반 길 후반 흉' },
  73: { number: 73, luck: '반길', keyword: '평범', description: '평범한 길수' },
  74: { number: 74, luck: '흉',   keyword: '과분', description: '뜻은 높으나 역부족' },
  75: { number: 75, luck: '반길', keyword: '수성', description: '지킴은 길, 진출은 흉' },
  76: { number: 76, luck: '흉',   keyword: '이산', description: '이산과 불안' },
  77: { number: 77, luck: '반길', keyword: '전후', description: '전반 길 후반 흉' },
  78: { number: 78, luck: '반길', keyword: '만성', description: '늦은 성공의 수' },
  79: { number: 79, luck: '흉',   keyword: '종극', description: '궁핍과 불안' },
  80: { number: 80, luck: '흉',   keyword: '은둔', description: '은퇴와 은둔의 수' },
  81: { number: 81, luck: '대길', keyword: '환원', description: '만물 귀원, 새 시작' },
};

/**
 * 수리 번호에 해당하는 81수리 정보를 반환합니다.
 * 81 초과 시 81로 나눈 나머지를 사용합니다 (순환 원리).
 * 나머지가 0이면 81로 처리합니다.
 */
export function getSuriLuck(num: number): SuriInfo {
  // 81 초과 시 순환 처리
  let n = num > 81 ? num % 81 : num;
  if (n === 0) n = 81;

  const entry = SURI_81_TABLE[n];
  if (entry) return entry;

  // 방어 코드: 범위 내에서 누락된 경우 (발생하지 않아야 함)
  return { number: n, luck: '흉', keyword: '미상', description: '분류 불명의 수' };
}

/**
 * 해당 수리가 길한 수인지 반환합니다.
 * '대길' 또는 '길'이면 true.
 */
export function isLuckySuri(num: number): boolean {
  const info = getSuriLuck(num);
  return info.luck === '대길' || info.luck === '길';
}
