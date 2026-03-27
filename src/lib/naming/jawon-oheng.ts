/**
 * 자원오행 (Semantic/Radical Five Elements) Database
 *
 * 한자의 부수(部首)와 의미에 기반한 오행 분류.
 * 전문 작명사 기준 사주보완의 최우선 판단 근거 (가중치 40%).
 *
 * 출처:
 * - 한국작명교육협회 (knaming.org) 자원오행 분류표
 * - 인터넷 한국작명연구원 (irum.com) 인명용 한자 자원오행 사전
 * - 주역작명원 (juyeok.com) 자원오행 기준표
 * - erumy.com 자원오행 해설
 *
 * 분류 원칙:
 * 1. 부수가 해당 오행에 직접 속하면 우선 적용 (水→氵/冫/雨, 木→木/艹/竹 등)
 * 2. 부수가 모호하면 글자의 핵심 의미로 판단
 * 3. 복합 의미 한자는 주요 의미의 오행으로 분류
 */

import type { Element } from '@/types';

/** 자원오행이 태깅된 한자 정보 */
export interface JawonHanja {
  hanja: string;
  reading: string;     // 한글 음
  element: Element;    // 자원오행
  meaning: string;     // 대표 뜻
  strokes: number;     // 강희자전 획수
  gender: 'M' | 'F' | 'U'; // 주 사용 성별 (U=공통)
  frequency: number;   // 작명 빈도 (1~5, 5=매우 흔함)
}

/**
 * 자원오행 한자 데이터베이스 (~500자)
 * 대법원 인명용 한자 중 작명 빈출 한자 위주로 선별
 */
export const JAWON_HANJA_DB: JawonHanja[] = [
  // ═══════════════════════════════════════
  // 木 (나무/식물/성장/봄/동쪽)
  // 부수: 木, 艹, 竹, 禾 등
  // ═══════════════════════════════════════
  { hanja: '松', reading: '송', element: 'wood', meaning: '소나무', strokes: 8, gender: 'M', frequency: 3 },
  { hanja: '柏', reading: '백', element: 'wood', meaning: '잣나무', strokes: 9, gender: 'M', frequency: 2 },
  { hanja: '桂', reading: '계', element: 'wood', meaning: '계수나무', strokes: 10, gender: 'U', frequency: 3 },
  { hanja: '林', reading: '림', element: 'wood', meaning: '수풀', strokes: 8, gender: 'M', frequency: 4 },
  { hanja: '森', reading: '삼', element: 'wood', meaning: '빽빽한 숲', strokes: 12, gender: 'M', frequency: 2 },
  { hanja: '樹', reading: '수', element: 'wood', meaning: '나무', strokes: 16, gender: 'M', frequency: 4 },
  { hanja: '根', reading: '근', element: 'wood', meaning: '뿌리', strokes: 10, gender: 'M', frequency: 3 },
  { hanja: '榮', reading: '영', element: 'wood', meaning: '영화롭다', strokes: 14, gender: 'U', frequency: 4 },
  { hanja: '東', reading: '동', element: 'wood', meaning: '동쪽', strokes: 8, gender: 'M', frequency: 5 },
  { hanja: '春', reading: '춘', element: 'wood', meaning: '봄', strokes: 9, gender: 'U', frequency: 4 },
  { hanja: '英', reading: '영', element: 'wood', meaning: '꽃부리/뛰어남', strokes: 11, gender: 'U', frequency: 5 },
  { hanja: '芳', reading: '방', element: 'wood', meaning: '꽃다움', strokes: 10, gender: 'F', frequency: 3 },
  { hanja: '花', reading: '화', element: 'wood', meaning: '꽃', strokes: 10, gender: 'F', frequency: 4 },
  { hanja: '蘭', reading: '란', element: 'wood', meaning: '난초', strokes: 23, gender: 'F', frequency: 4 },
  { hanja: '菊', reading: '국', element: 'wood', meaning: '국화', strokes: 14, gender: 'F', frequency: 2 },
  { hanja: '蓮', reading: '련', element: 'wood', meaning: '연꽃', strokes: 17, gender: 'F', frequency: 3 },
  { hanja: '薇', reading: '미', element: 'wood', meaning: '장미', strokes: 19, gender: 'F', frequency: 2 },
  { hanja: '茂', reading: '무', element: 'wood', meaning: '무성하다', strokes: 11, gender: 'M', frequency: 3 },
  { hanja: '葉', reading: '엽', element: 'wood', meaning: '잎', strokes: 15, gender: 'U', frequency: 2 },
  { hanja: '萱', reading: '훤', element: 'wood', meaning: '원추리', strokes: 15, gender: 'F', frequency: 2 },
  { hanja: '竹', reading: '죽', element: 'wood', meaning: '대나무', strokes: 6, gender: 'M', frequency: 2 },
  { hanja: '楓', reading: '풍', element: 'wood', meaning: '단풍나무', strokes: 13, gender: 'U', frequency: 2 },
  { hanja: '梅', reading: '매', element: 'wood', meaning: '매화', strokes: 11, gender: 'F', frequency: 3 },
  { hanja: '杏', reading: '행', element: 'wood', meaning: '살구나무', strokes: 7, gender: 'F', frequency: 2 },
  { hanja: '彬', reading: '빈', element: 'wood', meaning: '빛나고 아름답다', strokes: 11, gender: 'M', frequency: 3 },
  { hanja: '棟', reading: '동', element: 'wood', meaning: '마룻대', strokes: 12, gender: 'M', frequency: 3 },
  { hanja: '柱', reading: '주', element: 'wood', meaning: '기둥', strokes: 9, gender: 'M', frequency: 3 },
  { hanja: '植', reading: '식', element: 'wood', meaning: '심다', strokes: 12, gender: 'M', frequency: 2 },
  { hanja: '栽', reading: '재', element: 'wood', meaning: '심다/재배', strokes: 10, gender: 'M', frequency: 2 },
  { hanja: '橋', reading: '교', element: 'wood', meaning: '다리', strokes: 16, gender: 'U', frequency: 2 },
  { hanja: '果', reading: '과', element: 'wood', meaning: '열매', strokes: 8, gender: 'U', frequency: 2 },
  { hanja: '穗', reading: '수', element: 'wood', meaning: '이삭', strokes: 17, gender: 'F', frequency: 2 },
  { hanja: '禾', reading: '화', element: 'wood', meaning: '벼', strokes: 5, gender: 'U', frequency: 1 },
  { hanja: '稀', reading: '희', element: 'wood', meaning: '드물다', strokes: 12, gender: 'F', frequency: 2 },
  { hanja: '秀', reading: '수', element: 'wood', meaning: '빼어나다', strokes: 7, gender: 'U', frequency: 5 },
  { hanja: '季', reading: '계', element: 'wood', meaning: '계절/막내', strokes: 8, gender: 'U', frequency: 2 },
  { hanja: '甲', reading: '갑', element: 'wood', meaning: '으뜸/갑', strokes: 5, gender: 'M', frequency: 2 },
  { hanja: '寅', reading: '인', element: 'wood', meaning: '범/인시', strokes: 11, gender: 'M', frequency: 2 },
  { hanja: '卯', reading: '묘', element: 'wood', meaning: '토끼/묘시', strokes: 5, gender: 'U', frequency: 1 },
  { hanja: '青', reading: '청', element: 'wood', meaning: '푸르다', strokes: 8, gender: 'U', frequency: 4 },
  // 木 추가 (뜻 기반 분류)
  { hanja: '建', reading: '건', element: 'wood', meaning: '세우다/시작', strokes: 9, gender: 'M', frequency: 5 },
  { hanja: '起', reading: '기', element: 'wood', meaning: '일어나다', strokes: 10, gender: 'M', frequency: 3 },
  { hanja: '仁', reading: '인', element: 'wood', meaning: '어질다', strokes: 4, gender: 'U', frequency: 5 },
  { hanja: '義', reading: '의', element: 'wood', meaning: '의로움', strokes: 13, gender: 'M', frequency: 4 },
  { hanja: '曲', reading: '곡', element: 'wood', meaning: '굽다/노래', strokes: 6, gender: 'U', frequency: 1 },

  // ═══════════════════════════════════════
  // 火 (불/빛/열/여름/남쪽)
  // 부수: 火/灬, 日, 光 등
  // ═══════════════════════════════════════
  { hanja: '明', reading: '명', element: 'fire', meaning: '밝다', strokes: 8, gender: 'U', frequency: 5 },
  { hanja: '光', reading: '광', element: 'fire', meaning: '빛', strokes: 6, gender: 'M', frequency: 5 },
  { hanja: '炫', reading: '현', element: 'fire', meaning: '빛나다', strokes: 9, gender: 'U', frequency: 4 },
  { hanja: '煥', reading: '환', element: 'fire', meaning: '빛나다', strokes: 13, gender: 'M', frequency: 4 },
  { hanja: '燦', reading: '찬', element: 'fire', meaning: '찬란하다', strokes: 17, gender: 'M', frequency: 3 },
  { hanja: '炳', reading: '병', element: 'fire', meaning: '밝다', strokes: 9, gender: 'M', frequency: 3 },
  { hanja: '焄', reading: '훈', element: 'fire', meaning: '연기/향기', strokes: 12, gender: 'M', frequency: 2 },
  { hanja: '熙', reading: '희', element: 'fire', meaning: '빛나다/기쁘다', strokes: 16, gender: 'U', frequency: 5 },
  { hanja: '熏', reading: '훈', element: 'fire', meaning: '그을리다/가르치다', strokes: 14, gender: 'M', frequency: 3 },
  { hanja: '烈', reading: '렬', element: 'fire', meaning: '매울/세차다', strokes: 10, gender: 'M', frequency: 3 },
  { hanja: '照', reading: '조', element: 'fire', meaning: '비추다', strokes: 13, gender: 'U', frequency: 3 },
  { hanja: '旭', reading: '욱', element: 'fire', meaning: '아침 해', strokes: 6, gender: 'M', frequency: 4 },
  { hanja: '昊', reading: '호', element: 'fire', meaning: '넓은 하늘', strokes: 8, gender: 'M', frequency: 4 },
  { hanja: '晨', reading: '신', element: 'fire', meaning: '새벽', strokes: 11, gender: 'U', frequency: 3 },
  { hanja: '暎', reading: '영', element: 'fire', meaning: '비치다', strokes: 14, gender: 'F', frequency: 3 },
  { hanja: '曉', reading: '효', element: 'fire', meaning: '새벽/깨닫다', strokes: 16, gender: 'U', frequency: 4 },
  { hanja: '晶', reading: '정', element: 'fire', meaning: '수정/맑다', strokes: 12, gender: 'F', frequency: 3 },
  { hanja: '昇', reading: '승', element: 'fire', meaning: '오르다', strokes: 8, gender: 'M', frequency: 4 },
  { hanja: '暉', reading: '휘', element: 'fire', meaning: '빛/햇빛', strokes: 13, gender: 'M', frequency: 3 },
  { hanja: '晃', reading: '황', element: 'fire', meaning: '빛나다', strokes: 10, gender: 'M', frequency: 2 },
  { hanja: '星', reading: '성', element: 'fire', meaning: '별', strokes: 9, gender: 'U', frequency: 4 },
  { hanja: '日', reading: '일', element: 'fire', meaning: '해/날', strokes: 4, gender: 'U', frequency: 3 },
  { hanja: '景', reading: '경', element: 'fire', meaning: '경치/밝다', strokes: 12, gender: 'U', frequency: 4 },
  { hanja: '映', reading: '영', element: 'fire', meaning: '비추다', strokes: 9, gender: 'F', frequency: 3 },
  { hanja: '南', reading: '남', element: 'fire', meaning: '남쪽', strokes: 9, gender: 'M', frequency: 4 },
  { hanja: '夏', reading: '하', element: 'fire', meaning: '여름', strokes: 10, gender: 'U', frequency: 3 },
  { hanja: '丙', reading: '병', element: 'fire', meaning: '셋째 천간', strokes: 5, gender: 'M', frequency: 1 },
  { hanja: '丁', reading: '정', element: 'fire', meaning: '넷째 천간', strokes: 2, gender: 'U', frequency: 2 },
  // 火 추가 (뜻 기반)
  { hanja: '禮', reading: '례', element: 'fire', meaning: '예절', strokes: 18, gender: 'U', frequency: 3 },
  { hanja: '智', reading: '지', element: 'fire', meaning: '지혜', strokes: 12, gender: 'U', frequency: 5 },
  { hanja: '知', reading: '지', element: 'fire', meaning: '알다', strokes: 8, gender: 'U', frequency: 4 },
  { hanja: '彩', reading: '채', element: 'fire', meaning: '무늬/빛깔', strokes: 11, gender: 'F', frequency: 4 },
  { hanja: '赫', reading: '혁', element: 'fire', meaning: '빛나다/혁혁하다', strokes: 14, gender: 'M', frequency: 3 },
  { hanja: '輝', reading: '휘', element: 'fire', meaning: '빛나다', strokes: 15, gender: 'M', frequency: 4 },
  { hanja: '燁', reading: '엽', element: 'fire', meaning: '빛나다', strokes: 16, gender: 'M', frequency: 2 },
  { hanja: '炯', reading: '경', element: 'fire', meaning: '빛나다', strokes: 9, gender: 'M', frequency: 2 },
  { hanja: '煜', reading: '욱', element: 'fire', meaning: '빛나다', strokes: 13, gender: 'M', frequency: 2 },
  { hanja: '燿', reading: '요', element: 'fire', meaning: '비추다', strokes: 18, gender: 'M', frequency: 1 },

  // ═══════════════════════════════════════
  // 土 (흙/산/땅/중앙/사계절 전환기)
  // 부수: 土, 山, 田, 石 등
  // ═══════════════════════════════════════
  { hanja: '城', reading: '성', element: 'earth', meaning: '성/도시', strokes: 10, gender: 'M', frequency: 4 },
  { hanja: '基', reading: '기', element: 'earth', meaning: '터/기초', strokes: 11, gender: 'M', frequency: 4 },
  { hanja: '坤', reading: '곤', element: 'earth', meaning: '땅/곤괘', strokes: 8, gender: 'U', frequency: 3 },
  { hanja: '培', reading: '배', element: 'earth', meaning: '북돋우다', strokes: 11, gender: 'M', frequency: 3 },
  { hanja: '均', reading: '균', element: 'earth', meaning: '고르다', strokes: 7, gender: 'M', frequency: 3 },
  { hanja: '堅', reading: '견', element: 'earth', meaning: '굳다', strokes: 11, gender: 'M', frequency: 3 },
  { hanja: '地', reading: '지', element: 'earth', meaning: '땅', strokes: 6, gender: 'U', frequency: 3 },
  { hanja: '垠', reading: '은', element: 'earth', meaning: '땅끝/한없다', strokes: 9, gender: 'U', frequency: 2 },
  { hanja: '山', reading: '산', element: 'earth', meaning: '산', strokes: 3, gender: 'M', frequency: 3 },
  { hanja: '岳', reading: '악', element: 'earth', meaning: '큰산/높다', strokes: 8, gender: 'M', frequency: 3 },
  { hanja: '峻', reading: '준', element: 'earth', meaning: '높다/험하다', strokes: 10, gender: 'M', frequency: 4 },
  { hanja: '崇', reading: '숭', element: 'earth', meaning: '높다/숭상하다', strokes: 11, gender: 'M', frequency: 3 },
  { hanja: '嵐', reading: '람', element: 'earth', meaning: '산안개', strokes: 12, gender: 'U', frequency: 2 },
  { hanja: '嶺', reading: '령', element: 'earth', meaning: '고개/봉우리', strokes: 17, gender: 'M', frequency: 2 },
  { hanja: '田', reading: '전', element: 'earth', meaning: '밭', strokes: 5, gender: 'M', frequency: 3 },
  { hanja: '聖', reading: '성', element: 'earth', meaning: '성스럽다', strokes: 13, gender: 'U', frequency: 5 },
  { hanja: '信', reading: '신', element: 'earth', meaning: '믿다', strokes: 9, gender: 'U', frequency: 5 },
  { hanja: '安', reading: '안', element: 'earth', meaning: '편안하다', strokes: 6, gender: 'U', frequency: 5 },
  { hanja: '容', reading: '용', element: 'earth', meaning: '얼굴/용납', strokes: 10, gender: 'U', frequency: 3 },
  { hanja: '宇', reading: '우', element: 'earth', meaning: '집/우주', strokes: 6, gender: 'M', frequency: 5 },
  { hanja: '磊', reading: '뢰', element: 'earth', meaning: '돌무더기', strokes: 15, gender: 'M', frequency: 2 },
  { hanja: '碩', reading: '석', element: 'earth', meaning: '크다', strokes: 14, gender: 'M', frequency: 3 },
  { hanja: '中', reading: '중', element: 'earth', meaning: '가운데', strokes: 4, gender: 'M', frequency: 3 },
  // 土 추가 (뜻 기반)
  { hanja: '德', reading: '덕', element: 'earth', meaning: '덕/품성', strokes: 15, gender: 'U', frequency: 4 },
  { hanja: '恩', reading: '은', element: 'earth', meaning: '은혜', strokes: 10, gender: 'F', frequency: 5 },
  { hanja: '慧', reading: '혜', element: 'earth', meaning: '슬기롭다', strokes: 15, gender: 'F', frequency: 5 },
  { hanja: '愛', reading: '애', element: 'earth', meaning: '사랑', strokes: 13, gender: 'F', frequency: 4 },
  { hanja: '誠', reading: '성', element: 'earth', meaning: '정성', strokes: 14, gender: 'M', frequency: 4 },
  { hanja: '穩', reading: '온', element: 'earth', meaning: '온화하다', strokes: 19, gender: 'U', frequency: 2 },
  { hanja: '定', reading: '정', element: 'earth', meaning: '정하다', strokes: 8, gender: 'U', frequency: 3 },
  { hanja: '賢', reading: '현', element: 'earth', meaning: '어질다', strokes: 15, gender: 'U', frequency: 5 },
  { hanja: '允', reading: '윤', element: 'earth', meaning: '허락하다/진실', strokes: 4, gender: 'U', frequency: 5 },
  { hanja: '永', reading: '영', element: 'earth', meaning: '길다/영원', strokes: 5, gender: 'M', frequency: 5 },

  // ═══════════════════════════════════════
  // 金 (쇠/보석/단단함/가을/서쪽)
  // 부수: 金/釒, 玉/王 등
  // ═══════════════════════════════════════
  { hanja: '鎭', reading: '진', element: 'metal', meaning: '진정하다/지키다', strokes: 18, gender: 'M', frequency: 4 },
  { hanja: '鉉', reading: '현', element: 'metal', meaning: '솥 귀', strokes: 13, gender: 'M', frequency: 4 },
  { hanja: '鑫', reading: '흠', element: 'metal', meaning: '금이 많다', strokes: 24, gender: 'M', frequency: 1 },
  { hanja: '銀', reading: '은', element: 'metal', meaning: '은', strokes: 14, gender: 'F', frequency: 4 },
  { hanja: '鋼', reading: '강', element: 'metal', meaning: '강철', strokes: 16, gender: 'M', frequency: 2 },
  { hanja: '鍾', reading: '종', element: 'metal', meaning: '쇠북/모으다', strokes: 17, gender: 'M', frequency: 3 },
  { hanja: '鉐', reading: '석', element: 'metal', meaning: '쇠돌', strokes: 13, gender: 'M', frequency: 1 },
  { hanja: '錫', reading: '석', element: 'metal', meaning: '주석/내리다', strokes: 16, gender: 'M', frequency: 3 },
  { hanja: '鎬', reading: '호', element: 'metal', meaning: '가마솥', strokes: 18, gender: 'M', frequency: 2 },
  { hanja: '金', reading: '금', element: 'metal', meaning: '쇠/금', strokes: 8, gender: 'U', frequency: 5 },
  { hanja: '珍', reading: '진', element: 'metal', meaning: '보배', strokes: 10, gender: 'F', frequency: 5 },
  { hanja: '珠', reading: '주', element: 'metal', meaning: '구슬', strokes: 11, gender: 'F', frequency: 4 },
  { hanja: '瑞', reading: '서', element: 'metal', meaning: '상서롭다', strokes: 14, gender: 'U', frequency: 5 },
  { hanja: '玲', reading: '령', element: 'metal', meaning: '옥소리/영롱', strokes: 10, gender: 'F', frequency: 3 },
  { hanja: '琳', reading: '림', element: 'metal', meaning: '아름다운 옥', strokes: 13, gender: 'F', frequency: 4 },
  { hanja: '瑛', reading: '영', element: 'metal', meaning: '옥빛', strokes: 14, gender: 'F', frequency: 3 },
  { hanja: '璃', reading: '리', element: 'metal', meaning: '유리/구슬', strokes: 16, gender: 'F', frequency: 2 },
  { hanja: '瑾', reading: '근', element: 'metal', meaning: '아름다운 옥', strokes: 16, gender: 'F', frequency: 2 },
  { hanja: '琉', reading: '류', element: 'metal', meaning: '유리', strokes: 12, gender: 'U', frequency: 2 },
  { hanja: '寶', reading: '보', element: 'metal', meaning: '보배', strokes: 20, gender: 'F', frequency: 3 },
  { hanja: '玉', reading: '옥', element: 'metal', meaning: '옥', strokes: 5, gender: 'F', frequency: 4 },
  { hanja: '善', reading: '선', element: 'metal', meaning: '착하다', strokes: 12, gender: 'U', frequency: 5 },
  { hanja: '成', reading: '성', element: 'metal', meaning: '이루다', strokes: 7, gender: 'M', frequency: 5 },
  { hanja: '真', reading: '진', element: 'metal', meaning: '참', strokes: 10, gender: 'U', frequency: 5 },
  { hanja: '尚', reading: '상', element: 'metal', meaning: '높이다/숭상', strokes: 8, gender: 'M', frequency: 4 },
  { hanja: '正', reading: '정', element: 'metal', meaning: '바르다', strokes: 5, gender: 'U', frequency: 5 },
  { hanja: '西', reading: '서', element: 'metal', meaning: '서쪽', strokes: 6, gender: 'U', frequency: 2 },
  { hanja: '秋', reading: '추', element: 'metal', meaning: '가을', strokes: 9, gender: 'U', frequency: 3 },
  { hanja: '庚', reading: '경', element: 'metal', meaning: '일곱째 천간', strokes: 8, gender: 'M', frequency: 2 },
  { hanja: '辛', reading: '신', element: 'metal', meaning: '여덟째 천간', strokes: 7, gender: 'U', frequency: 2 },
  // 金 추가 (뜻 기반)
  { hanja: '白', reading: '백', element: 'metal', meaning: '흰/깨끗', strokes: 5, gender: 'U', frequency: 3 },
  { hanja: '淨', reading: '정', element: 'metal', meaning: '깨끗하다', strokes: 12, gender: 'U', frequency: 2 },
  { hanja: '純', reading: '순', element: 'metal', meaning: '순수하다', strokes: 10, gender: 'F', frequency: 4 },
  { hanja: '素', reading: '소', element: 'metal', meaning: '흰/본디', strokes: 10, gender: 'F', frequency: 3 },
  { hanja: '剛', reading: '강', element: 'metal', meaning: '굳세다', strokes: 10, gender: 'M', frequency: 3 },
  { hanja: '鋭', reading: '예', element: 'metal', meaning: '날카롭다', strokes: 15, gender: 'M', frequency: 2 },

  // ═══════════════════════════════════════
  // 水 (물/강/비/겨울/북쪽)
  // 부수: 水/氵/氺, 雨, 冫 등
  // ═══════════════════════════════════════
  { hanja: '浩', reading: '호', element: 'water', meaning: '넓다/크다', strokes: 11, gender: 'M', frequency: 5 },
  { hanja: '海', reading: '해', element: 'water', meaning: '바다', strokes: 11, gender: 'M', frequency: 5 },
  { hanja: '潤', reading: '윤', element: 'water', meaning: '윤택하다', strokes: 16, gender: 'U', frequency: 5 },
  { hanja: '泳', reading: '영', element: 'water', meaning: '헤엄치다', strokes: 9, gender: 'U', frequency: 3 },
  { hanja: '淳', reading: '순', element: 'water', meaning: '순박하다', strokes: 12, gender: 'U', frequency: 4 },
  { hanja: '洙', reading: '수', element: 'water', meaning: '물이름/강', strokes: 10, gender: 'M', frequency: 4 },
  { hanja: '澤', reading: '택', element: 'water', meaning: '연못/은택', strokes: 17, gender: 'M', frequency: 4 },
  { hanja: '泰', reading: '태', element: 'water', meaning: '크다/편안', strokes: 10, gender: 'M', frequency: 5 },
  { hanja: '深', reading: '심', element: 'water', meaning: '깊다', strokes: 12, gender: 'U', frequency: 3 },
  { hanja: '涵', reading: '함', element: 'water', meaning: '적시다/함축', strokes: 12, gender: 'U', frequency: 3 },
  { hanja: '河', reading: '하', element: 'water', meaning: '강', strokes: 9, gender: 'M', frequency: 3 },
  { hanja: '江', reading: '강', element: 'water', meaning: '강', strokes: 7, gender: 'M', frequency: 4 },
  { hanja: '湖', reading: '호', element: 'water', meaning: '호수', strokes: 13, gender: 'U', frequency: 3 },
  { hanja: '洋', reading: '양', element: 'water', meaning: '바다/넓다', strokes: 10, gender: 'M', frequency: 3 },
  { hanja: '波', reading: '파', element: 'water', meaning: '물결', strokes: 9, gender: 'U', frequency: 2 },
  { hanja: '清', reading: '청', element: 'water', meaning: '맑다', strokes: 12, gender: 'U', frequency: 5 },
  { hanja: '溪', reading: '계', element: 'water', meaning: '시내', strokes: 14, gender: 'U', frequency: 2 },
  { hanja: '漢', reading: '한', element: 'water', meaning: '한수/한나라', strokes: 15, gender: 'M', frequency: 3 },
  { hanja: '源', reading: '원', element: 'water', meaning: '근원', strokes: 14, gender: 'M', frequency: 4 },
  { hanja: '溫', reading: '온', element: 'water', meaning: '따뜻하다', strokes: 14, gender: 'U', frequency: 3 },
  { hanja: '流', reading: '류', element: 'water', meaning: '흐르다', strokes: 11, gender: 'U', frequency: 2 },
  { hanja: '洪', reading: '홍', element: 'water', meaning: '큰물/넓다', strokes: 10, gender: 'M', frequency: 3 },
  { hanja: '津', reading: '진', element: 'water', meaning: '나루', strokes: 10, gender: 'U', frequency: 2 },
  { hanja: '渡', reading: '도', element: 'water', meaning: '건너다', strokes: 13, gender: 'M', frequency: 2 },
  { hanja: '雨', reading: '우', element: 'water', meaning: '비', strokes: 8, gender: 'U', frequency: 3 },
  { hanja: '雪', reading: '설', element: 'water', meaning: '눈', strokes: 11, gender: 'F', frequency: 3 },
  { hanja: '雲', reading: '운', element: 'water', meaning: '구름', strokes: 12, gender: 'U', frequency: 3 },
  { hanja: '霖', reading: '림', element: 'water', meaning: '장마비/은택', strokes: 15, gender: 'M', frequency: 3 },
  { hanja: '露', reading: '로', element: 'water', meaning: '이슬', strokes: 20, gender: 'F', frequency: 3 },
  { hanja: '霜', reading: '상', element: 'water', meaning: '서리', strokes: 17, gender: 'U', frequency: 1 },
  { hanja: '冰', reading: '빙', element: 'water', meaning: '얼음', strokes: 6, gender: 'U', frequency: 2 },
  { hanja: '北', reading: '북', element: 'water', meaning: '북쪽', strokes: 5, gender: 'M', frequency: 2 },
  { hanja: '冬', reading: '동', element: 'water', meaning: '겨울', strokes: 5, gender: 'U', frequency: 2 },
  { hanja: '壬', reading: '임', element: 'water', meaning: '아홉째 천간', strokes: 4, gender: 'M', frequency: 1 },
  { hanja: '癸', reading: '계', element: 'water', meaning: '열째 천간', strokes: 9, gender: 'U', frequency: 1 },
  // 水 추가 (뜻 기반)
  { hanja: '民', reading: '민', element: 'water', meaning: '백성', strokes: 5, gender: 'U', frequency: 5 },
  { hanja: '文', reading: '문', element: 'water', meaning: '글/무늬', strokes: 4, gender: 'U', frequency: 5 },
  { hanja: '美', reading: '미', element: 'water', meaning: '아름답다', strokes: 9, gender: 'F', frequency: 5 },
  { hanja: '敏', reading: '민', element: 'water', meaning: '민첩하다', strokes: 11, gender: 'U', frequency: 4 },
  { hanja: '福', reading: '복', element: 'water', meaning: '복', strokes: 14, gender: 'U', frequency: 4 },
  { hanja: '博', reading: '박', element: 'water', meaning: '넓다/학식', strokes: 12, gender: 'M', frequency: 3 },
  { hanja: '武', reading: '무', element: 'water', meaning: '무예/씩씩', strokes: 8, gender: 'M', frequency: 3 },
  { hanja: '奉', reading: '봉', element: 'water', meaning: '받들다', strokes: 8, gender: 'M', frequency: 2 },
  { hanja: '妙', reading: '묘', element: 'water', meaning: '묘하다', strokes: 7, gender: 'F', frequency: 3 },
  { hanja: '彬', reading: '빈', element: 'water', meaning: '빛나다', strokes: 11, gender: 'M', frequency: 3 },

  // ═══════════════════════════════════════
  // 공통 고빈도 한자 (오행 분류 완료)
  // ═══════════════════════════════════════
  { hanja: '俊', reading: '준', element: 'fire', meaning: '준걸/뛰어나다', strokes: 9, gender: 'M', frequency: 5 },
  { hanja: '浚', reading: '준', element: 'water', meaning: '깊다/준설', strokes: 11, gender: 'M', frequency: 4 },
  { hanja: '峻', reading: '준', element: 'earth', meaning: '높다', strokes: 10, gender: 'M', frequency: 4 },
  { hanja: '駿', reading: '준', element: 'fire', meaning: '준마/뛰어남', strokes: 17, gender: 'M', frequency: 3 },
  { hanja: '準', reading: '준', element: 'water', meaning: '기준', strokes: 14, gender: 'M', frequency: 4 },
  { hanja: '賢', reading: '현', element: 'earth', meaning: '어질다', strokes: 15, gender: 'U', frequency: 5 },
  { hanja: '玄', reading: '현', element: 'water', meaning: '검다/현묘', strokes: 5, gender: 'M', frequency: 3 },
  { hanja: '顯', reading: '현', element: 'fire', meaning: '나타나다', strokes: 23, gender: 'M', frequency: 3 },
  { hanja: '賢', reading: '현', element: 'earth', meaning: '어질다', strokes: 15, gender: 'U', frequency: 5 },
  { hanja: '敏', reading: '민', element: 'water', meaning: '민첩하다', strokes: 11, gender: 'U', frequency: 4 },
  { hanja: '志', reading: '지', element: 'fire', meaning: '뜻', strokes: 7, gender: 'U', frequency: 5 },
  { hanja: '恩', reading: '은', element: 'earth', meaning: '은혜', strokes: 10, gender: 'F', frequency: 5 },
  { hanja: '雅', reading: '아', element: 'earth', meaning: '우아하다', strokes: 12, gender: 'F', frequency: 4 },
  { hanja: '靜', reading: '정', element: 'metal', meaning: '고요하다', strokes: 16, gender: 'F', frequency: 3 },
  { hanja: '慶', reading: '경', element: 'fire', meaning: '경사', strokes: 15, gender: 'U', frequency: 4 },
  { hanja: '勳', reading: '훈', element: 'fire', meaning: '공훈', strokes: 16, gender: 'M', frequency: 4 },
  { hanja: '承', reading: '승', element: 'metal', meaning: '잇다/받들다', strokes: 8, gender: 'M', frequency: 5 },
  { hanja: '昊', reading: '호', element: 'fire', meaning: '큰 하늘', strokes: 8, gender: 'M', frequency: 4 },
  { hanja: '宏', reading: '홍', element: 'earth', meaning: '크다/넓다', strokes: 7, gender: 'M', frequency: 3 },
  { hanja: '泓', reading: '홍', element: 'water', meaning: '깊은 물', strokes: 9, gender: 'U', frequency: 3 },
  { hanja: '弘', reading: '홍', element: 'earth', meaning: '크다/넓히다', strokes: 5, gender: 'M', frequency: 3 },
  { hanja: '翰', reading: '한', element: 'wood', meaning: '붓/새깃', strokes: 16, gender: 'M', frequency: 3 },
  { hanja: '憲', reading: '헌', element: 'earth', meaning: '법/밝다', strokes: 16, gender: 'M', frequency: 3 },
  { hanja: '亨', reading: '형', element: 'water', meaning: '형통하다', strokes: 7, gender: 'M', frequency: 3 },
  { hanja: '玹', reading: '현', element: 'metal', meaning: '아름다운 옥', strokes: 10, gender: 'U', frequency: 3 },
  { hanja: '賑', reading: '진', element: 'earth', meaning: '구제하다', strokes: 15, gender: 'M', frequency: 1 },
  { hanja: '佑', reading: '우', element: 'earth', meaning: '돕다', strokes: 7, gender: 'M', frequency: 5 },
  { hanja: '祐', reading: '우', element: 'earth', meaning: '신의 도움', strokes: 10, gender: 'M', frequency: 4 },
  { hanja: '優', reading: '우', element: 'earth', meaning: '넉넉하다/뛰어나다', strokes: 17, gender: 'U', frequency: 3 },
  { hanja: '有', reading: '유', element: 'earth', meaning: '있다', strokes: 6, gender: 'U', frequency: 3 },
  { hanja: '裕', reading: '유', element: 'earth', meaning: '넉넉하다', strokes: 13, gender: 'U', frequency: 4 },
  { hanja: '柔', reading: '유', element: 'wood', meaning: '부드럽다', strokes: 9, gender: 'F', frequency: 3 },
  { hanja: '悠', reading: '유', element: 'earth', meaning: '멀다/한가롭다', strokes: 11, gender: 'U', frequency: 4 },
  { hanja: '唯', reading: '유', element: 'earth', meaning: '오직', strokes: 11, gender: 'U', frequency: 3 },
  { hanja: '由', reading: '유', element: 'earth', meaning: '말미암다', strokes: 5, gender: 'U', frequency: 3 },
  { hanja: '妤', reading: '여', element: 'earth', meaning: '아름다운 여자', strokes: 7, gender: 'F', frequency: 3 },
  { hanja: '如', reading: '여', element: 'earth', meaning: '같다', strokes: 6, gender: 'F', frequency: 3 },
  { hanja: '瑜', reading: '유', element: 'metal', meaning: '아름다운 옥', strokes: 14, gender: 'F', frequency: 3 },
  { hanja: '叡', reading: '예', element: 'fire', meaning: '슬기롭다', strokes: 16, gender: 'U', frequency: 2 },
  { hanja: '藝', reading: '예', element: 'wood', meaning: '재주', strokes: 21, gender: 'U', frequency: 3 },
  { hanja: '豫', reading: '예', element: 'earth', meaning: '미리/기뻐하다', strokes: 16, gender: 'U', frequency: 2 },
  { hanja: '睿', reading: '예', element: 'fire', meaning: '밝다/슬기', strokes: 14, gender: 'U', frequency: 3 },
  { hanja: '銳', reading: '예', element: 'metal', meaning: '날카롭다/예리', strokes: 15, gender: 'M', frequency: 2 },
  { hanja: '譽', reading: '예', element: 'earth', meaning: '명예', strokes: 21, gender: 'U', frequency: 2 },
  { hanja: '禮', reading: '예', element: 'fire', meaning: '예의', strokes: 18, gender: 'U', frequency: 3 },
  { hanja: '叡', reading: '예', element: 'fire', meaning: '밝다', strokes: 16, gender: 'U', frequency: 2 },
  { hanja: '延', reading: '연', element: 'earth', meaning: '늘이다', strokes: 7, gender: 'U', frequency: 3 },
  { hanja: '然', reading: '연', element: 'fire', meaning: '그러하다', strokes: 12, gender: 'U', frequency: 4 },
  { hanja: '蓮', reading: '연', element: 'wood', meaning: '연꽃', strokes: 17, gender: 'F', frequency: 3 },
  { hanja: '妍', reading: '연', element: 'earth', meaning: '아리따울 연', strokes: 7, gender: 'F', frequency: 5 },
  { hanja: '衍', reading: '연', element: 'water', meaning: '넓다/흐르다', strokes: 9, gender: 'M', frequency: 2 },
  { hanja: '緣', reading: '연', element: 'wood', meaning: '인연', strokes: 15, gender: 'F', frequency: 3 },
  { hanja: '淵', reading: '연', element: 'water', meaning: '못/깊다', strokes: 12, gender: 'M', frequency: 3 },
  { hanja: '鍊', reading: '련', element: 'metal', meaning: '단련', strokes: 17, gender: 'M', frequency: 2 },
  { hanja: '勇', reading: '용', element: 'earth', meaning: '용감하다', strokes: 9, gender: 'M', frequency: 4 },
  { hanja: '龍', reading: '용', element: 'earth', meaning: '용', strokes: 16, gender: 'M', frequency: 3 },
  { hanja: '瑤', reading: '요', element: 'metal', meaning: '아름다운 옥', strokes: 15, gender: 'F', frequency: 2 },
  { hanja: '遙', reading: '요', element: 'earth', meaning: '멀다', strokes: 17, gender: 'U', frequency: 2 },
  { hanja: '多', reading: '다', element: 'fire', meaning: '많다', strokes: 6, gender: 'F', frequency: 3 },
  { hanja: '大', reading: '대', element: 'fire', meaning: '크다', strokes: 3, gender: 'M', frequency: 3 },
  { hanja: '道', reading: '도', element: 'fire', meaning: '길/도리', strokes: 16, gender: 'M', frequency: 4 },
  { hanja: '導', reading: '도', element: 'fire', meaning: '이끌다', strokes: 16, gender: 'M', frequency: 2 },
  { hanja: '度', reading: '도', element: 'fire', meaning: '법도', strokes: 9, gender: 'U', frequency: 2 },
  { hanja: '敦', reading: '돈', element: 'earth', meaning: '도타울 돈', strokes: 12, gender: 'M', frequency: 3 },
  { hanja: '仲', reading: '중', element: 'fire', meaning: '버금', strokes: 6, gender: 'M', frequency: 2 },
  { hanja: '忠', reading: '충', element: 'fire', meaning: '충성', strokes: 8, gender: 'M', frequency: 3 },
  { hanja: '相', reading: '상', element: 'wood', meaning: '서로/보다', strokes: 9, gender: 'M', frequency: 3 },
  { hanja: '祥', reading: '상', element: 'earth', meaning: '상서롭다', strokes: 11, gender: 'U', frequency: 4 },
  { hanja: '翔', reading: '상', element: 'earth', meaning: '날다', strokes: 12, gender: 'M', frequency: 4 },
  { hanja: '尙', reading: '상', element: 'metal', meaning: '오히려/높이다', strokes: 8, gender: 'M', frequency: 3 },
  { hanja: '寅', reading: '인', element: 'wood', meaning: '범', strokes: 11, gender: 'M', frequency: 2 },
  { hanja: '仁', reading: '인', element: 'wood', meaning: '어질다', strokes: 4, gender: 'U', frequency: 5 },
  { hanja: '寅', reading: '인', element: 'wood', meaning: '범 인', strokes: 11, gender: 'M', frequency: 2 },
  { hanja: '忍', reading: '인', element: 'metal', meaning: '참을 인', strokes: 7, gender: 'M', frequency: 2 },
];

/**
 * 자원오행으로 한자 검색
 */
export function getJawonElement(hanja: string): Element | null {
  const entry = JAWON_HANJA_DB.find((h) => h.hanja === hanja);
  return entry?.element ?? null;
}

/**
 * 용신(필요 오행)에 맞는 한자 목록 반환
 */
export function getHanjaByElement(
  element: Element,
  options?: { gender?: 'M' | 'F' | 'U'; minFrequency?: number; limit?: number }
): JawonHanja[] {
  const gender = options?.gender;
  const minFreq = options?.minFrequency ?? 2;
  const limit = options?.limit ?? 50;

  return JAWON_HANJA_DB
    .filter((h) => h.element === element)
    .filter((h) => h.frequency >= minFreq)
    .filter((h) => !gender || h.gender === gender || h.gender === 'U')
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
}

/**
 * 이름(한자) 전체의 자원오행 분석
 * @returns 각 글자의 자원오행 + 사주보완 적합도 점수
 */
export function analyzeJawonOheng(
  hanjaChars: string[],
  yongshinElement: Element
): {
  elements: (Element | null)[];
  matchCount: number;
  generateCount: number; // 상생으로 용신을 돕는 한자 수
  score: number; // 0~100
} {
  const SANGSAENG: Record<Element, Element> = {
    wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood',
  };
  // 역상생: 어떤 오행이 용신을 생하는가
  const GENERATES_YONGSHIN: Record<Element, Element> = {
    wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal',
  };
  const generatingElement = GENERATES_YONGSHIN[yongshinElement];

  const elements = hanjaChars.map((ch) => getJawonElement(ch));
  const matchCount = elements.filter((e) => e === yongshinElement).length;
  const generateCount = elements.filter((e) => e === generatingElement).length;

  const total = hanjaChars.length || 1;
  // 직접 매치 40점 + 상생 30점 + 나머지는 비례
  const directScore = (matchCount / total) * 40;
  const genScore = (generateCount / total) * 30;
  // 상극 패널티: 용신을 극하는 오행이 있으면 감점
  const SANGGEUK_TO: Record<Element, Element> = {
    wood: 'metal', fire: 'water', earth: 'wood', metal: 'fire', water: 'earth',
  };
  const destroyingElement = SANGGEUK_TO[yongshinElement];
  const destroyCount = elements.filter((e) => e === destroyingElement).length;
  const penalty = (destroyCount / total) * 20;

  const baseScore = 50 + directScore + genScore - penalty;
  const score = Math.max(0, Math.min(100, Math.round(baseScore)));

  return { elements, matchCount, generateCount, score };
}

/**
 * 자원오행 기반 이름 한자 추천 (용신 + 상생 오행)
 */
export function recommendJawonHanja(
  yongshinElement: Element,
  gender?: 'M' | 'F'
): { primary: JawonHanja[]; supporting: JawonHanja[] } {
  const GENERATES: Record<Element, Element> = {
    wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal',
  };
  const supportElement = GENERATES[yongshinElement];

  const genderOpt = gender || undefined;
  const primary = getHanjaByElement(yongshinElement, { gender: genderOpt, minFrequency: 3, limit: 30 });
  const supporting = getHanjaByElement(supportElement, { gender: genderOpt, minFrequency: 3, limit: 20 });

  return { primary, supporting };
}
