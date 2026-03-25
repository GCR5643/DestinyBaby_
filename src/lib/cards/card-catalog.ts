/**
 * 카드 카탈로그 — MVP 30종 (6등급 × 5오행)
 * B안: 아기 캐릭터 + 수호 동물 스타일
 *
 * 각 카드에 이미지 생성 프롬프트 포함 (DALL-E / Midjourney 호환)
 */

import type { Grade, Element } from '@/types';

export interface CardTemplate {
  id: string;
  name: string;
  nameEn: string;
  grade: Grade;
  element: Element;
  guardian: string;        // 수호 동물/존재
  ability: string;         // 카드 능력 설명
  description: string;     // 카드 설명 텍스트
  imagePrompt: string;     // AI 이미지 생성용 프롬프트
}

// ── 오행별 수호 동물 ─────────────────────────────────────────────────────────
const GUARDIAN_BY_ELEMENT: Record<Element, { name: string; nameEn: string }[]> = {
  wood: [
    { name: '청룡', nameEn: 'Azure Dragon' },
    { name: '토끼', nameEn: 'Rabbit' },
    { name: '호랑이', nameEn: 'Tiger' },
  ],
  fire: [
    { name: '주작', nameEn: 'Vermillion Bird' },
    { name: '뱀', nameEn: 'Serpent' },
    { name: '말', nameEn: 'Horse' },
  ],
  earth: [
    { name: '기린', nameEn: 'Qilin' },
    { name: '소', nameEn: 'Ox' },
    { name: '양', nameEn: 'Sheep' },
  ],
  metal: [
    { name: '백호', nameEn: 'White Tiger' },
    { name: '원숭이', nameEn: 'Monkey' },
    { name: '닭', nameEn: 'Rooster' },
  ],
  water: [
    { name: '현무', nameEn: 'Black Tortoise' },
    { name: '쥐', nameEn: 'Rat' },
    { name: '돼지', nameEn: 'Pig' },
  ],
};

// ── 오행별 색상/분위기 키워드 ─────────────────────────────────────────────────
const ELEMENT_STYLE: Record<Element, { palette: string; mood: string; symbol: string }> = {
  wood:  { palette: 'emerald green, spring lime, soft jade', mood: 'growth, new life, spring morning', symbol: 'blooming cherry blossom, bamboo leaves' },
  fire:  { palette: 'warm gold, sunset orange, crimson red', mood: 'passion, warmth, radiant energy', symbol: 'flame wisps, sun rays' },
  earth: { palette: 'amber gold, warm brown, terracotta', mood: 'stability, warmth, nurturing', symbol: 'mountain peak, golden field' },
  metal: { palette: 'silver, platinum, ice blue', mood: 'precision, purity, clarity', symbol: 'crystal shards, silver dust' },
  water: { palette: 'deep blue, aquamarine, soft violet', mood: 'wisdom, flow, tranquility', symbol: 'water ripples, moon reflection' },
};

// ── 등급별 시각 스타일 ────────────────────────────────────────────────────────
const GRADE_STYLE: Record<Grade, { quality: string; aura: string; frame: string }> = {
  N:   { quality: 'simple flat illustration', aura: 'subtle soft glow', frame: 'thin silver border' },
  R:   { quality: 'clean digital art', aura: 'gentle aura ring', frame: 'blue metallic border' },
  SR:  { quality: 'detailed digital painting', aura: 'purple mystical aura', frame: 'ornate purple and gold border' },
  SSR: { quality: 'high-detail fantasy art', aura: 'golden radiant aura, light beams', frame: 'elaborate gold border with jewels' },
  UR:  { quality: 'ultra-detailed masterpiece', aura: 'crimson divine aura, ethereal particles', frame: 'crimson and platinum ornate border with gems' },
  SSS: { quality: 'breathtaking masterpiece, 8K, cinematic', aura: 'rainbow prismatic aura, divine light rays, floating runes', frame: 'legendary rainbow holographic border with celestial engravings' },
};

// ── 카드 이름 ─────────────────────────────────────────────────────────────────
const CARD_NAMES: Record<Element, Record<Grade, { name: string; nameEn: string; ability: string }>> = {
  wood: {
    N:   { name: '새싹의 기운', nameEn: 'Sprout Energy', ability: '작은 씨앗에서 무한한 가능성이 싹트는 힘' },
    R:   { name: '초록의 힘', nameEn: 'Verdant Force', ability: '대지를 초록으로 물들이는 생명의 힘' },
    SR:  { name: '숲의 수호자', nameEn: 'Forest Guardian', ability: '깊은 숲의 고요한 보호막을 두르는 힘' },
    SSR: { name: '봄바람의 축복', nameEn: 'Spring Wind Blessing', ability: '따뜻한 봄바람이 모든 것을 깨우는 축복' },
    UR:  { name: '세계수의 각성', nameEn: 'World Tree Awakening', ability: '하늘과 땅을 잇는 세계수의 거대한 기운' },
    SSS: { name: '창조의 숨결', nameEn: 'Breath of Creation', ability: '만물을 탄생시키는 근원적 생명력' },
  },
  fire: {
    N:   { name: '불꽃 씨앗', nameEn: 'Ember Seed', ability: '마음속 작은 불꽃이 피어나는 시작' },
    R:   { name: '열정의 불꽃', nameEn: 'Flame of Passion', ability: '열정으로 타오르는 따뜻한 에너지' },
    SR:  { name: '태양의 빛', nameEn: 'Sunlight', ability: '세상을 밝게 비추는 태양의 축복' },
    SSR: { name: '불사조의 깃털', nameEn: 'Phoenix Feather', ability: '불사조의 깃털이 새로운 시작을 밝히는 힘' },
    UR:  { name: '태양신의 눈동자', nameEn: 'Eye of the Sun God', ability: '태양신이 내려다보는 절대적 빛의 힘' },
    SSS: { name: '영원의 불꽃', nameEn: 'Eternal Flame', ability: '영원히 꺼지지 않는 우주의 시원한 불꽃' },
  },
  earth: {
    N:   { name: '흙의 품', nameEn: 'Earth Embrace', ability: '부드러운 흙이 감싸는 안정의 기운' },
    R:   { name: '대지의 힘', nameEn: 'Earth Power', ability: '든든한 대지가 받쳐주는 굳건한 힘' },
    SR:  { name: '황금 들판', nameEn: 'Golden Fields', ability: '풍요로운 수확을 약속하는 황금빛 기운' },
    SSR: { name: '산왕의 축복', nameEn: 'Mountain King Blessing', ability: '산의 왕이 내리는 흔들리지 않는 축복' },
    UR:  { name: '대륙의 심장', nameEn: 'Heart of the Continent', ability: '대륙의 심장에서 뿜어져 나오는 근원의 힘' },
    SSS: { name: '천지개벽', nameEn: 'Genesis', ability: '천지가 열리며 새 세상을 만드는 창조의 힘' },
  },
  metal: {
    N:   { name: '은빛 조각', nameEn: 'Silver Shard', ability: '순수한 은빛이 마음을 맑게 하는 힘' },
    R:   { name: '강철의 의지', nameEn: 'Iron Will', ability: '단단한 강철처럼 굳건한 의지의 힘' },
    SR:  { name: '빛나는 보석', nameEn: 'Radiant Gem', ability: '보석처럼 빛나는 내면의 아름다움' },
    SSR: { name: '백호의 포효', nameEn: 'White Tiger Roar', ability: '백호의 포효가 사방을 진동시키는 힘' },
    UR:  { name: '천상의 검', nameEn: 'Celestial Blade', ability: '하늘에서 내려온 신성한 검의 절대 의지' },
    SSS: { name: '우주의 결정', nameEn: 'Cosmic Crystal', ability: '우주의 모든 별빛이 하나로 결정된 궁극의 힘' },
  },
  water: {
    N:   { name: '이슬방울', nameEn: 'Dewdrop', ability: '아침 이슬처럼 맑고 순수한 기운' },
    R:   { name: '흐르는 물', nameEn: 'Flowing Water', ability: '부드럽게 흐르며 모든 것을 감싸는 힘' },
    SR:  { name: '깊은 바다', nameEn: 'Deep Ocean', ability: '깊은 바다의 신비로운 지혜를 품은 힘' },
    SSR: { name: '현무의 지혜', nameEn: 'Black Tortoise Wisdom', ability: '현무가 전하는 만년의 지혜' },
    UR:  { name: '용왕의 진주', nameEn: 'Dragon King Pearl', ability: '용궁 깊은 곳의 만능 진주의 힘' },
    SSS: { name: '시간의 파도', nameEn: 'Tidal Wave of Time', ability: '시간을 넘나드는 초월적 파도의 힘' },
  },
};

// ── 프롬프트 빌더 ─────────────────────────────────────────────────────────────
function buildImagePrompt(element: Element, grade: Grade, guardian: string): string {
  const style = ELEMENT_STYLE[element];
  const gradeStyle = GRADE_STYLE[grade];
  const cardInfo = CARD_NAMES[element][grade];

  return [
    `A cute Korean baby character (chibi style, big sparkling eyes, rosy cheeks)`,
    `sitting with a majestic ${guardian} as guardian spirit`,
    `in a magical ${style.mood} scene`,
    `color palette: ${style.palette}`,
    `decorated with ${style.symbol}`,
    `${gradeStyle.aura} surrounding them`,
    `${gradeStyle.quality}`,
    `vertical card art composition (2:3 ratio), centered, ${gradeStyle.frame}`,
    `Korean fantasy aesthetic, soft lighting, no text, no watermark`,
    `card name reference: "${cardInfo.nameEn}"`,
  ].join(', ');
}

// ── 카탈로그 생성 ─────────────────────────────────────────────────────────────
const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
const GRADES: Grade[] = ['N', 'R', 'SR', 'SSR', 'UR', 'SSS'];

export const CARD_CATALOG: CardTemplate[] = ELEMENTS.flatMap((element) =>
  GRADES.map((grade) => {
    const cardInfo = CARD_NAMES[element][grade];
    const guardians = GUARDIAN_BY_ELEMENT[element];
    // 등급에 따라 다른 수호자: N-SR → 12지신, SSR-SSS → 사신수
    const guardianIdx = grade === 'N' || grade === 'R' ? 1 : grade === 'SR' ? 2 : 0;
    const guardian = guardians[guardianIdx] ?? guardians[0];

    return {
      id: `${element}-${grade.toLowerCase()}`,
      name: cardInfo.name,
      nameEn: cardInfo.nameEn,
      grade,
      element,
      guardian: guardian.name,
      ability: cardInfo.ability,
      description: `${cardInfo.name} — ${cardInfo.ability}`,
      imagePrompt: buildImagePrompt(element, grade, guardian.nameEn),
    };
  })
);

// ── 유틸 ──────────────────────────────────────────────────────────────────────

/** 카드 카탈로그에서 오행+등급으로 조회 */
export function getCardTemplate(element: Element, grade: Grade): CardTemplate | undefined {
  return CARD_CATALOG.find(c => c.element === element && c.grade === grade);
}

/** 랜덤 카드 템플릿 (등급은 외부에서 결정, 오행만 랜덤 또는 지정) */
export function pickCardTemplate(grade: Grade, element?: Element): CardTemplate {
  const pool = element
    ? CARD_CATALOG.filter(c => c.grade === grade && c.element === element)
    : CARD_CATALOG.filter(c => c.grade === grade);
  return pool[Math.floor(Math.random() * pool.length)] ?? CARD_CATALOG[0];
}

/** 등급별 한국어 라벨 */
export const GRADE_LABELS_KO: Record<Grade, string> = {
  N: '일반', R: '레어', SR: '슈퍼레어', SSR: '초레어', UR: '울트라레어', SSS: '신화',
};

/** 등급별 색상 */
export const GRADE_COLORS: Record<Grade, string> = {
  N: '#95a5a6', R: '#4a90d9', SR: '#a29bfe', SSR: '#F9CA24', UR: '#dc2626', SSS: '#e17055',
};
