/**
 * 작명 로직 테스트 스크립트
 * 실행: npx tsx scripts/test-naming.ts
 */
import { calculateSaju } from '../src/lib/saju/saju-calculator';
import { recommendJawonHanja, analyzeJawonOheng } from '../src/lib/naming/jawon-oheng';
import { validateBulyong } from '../src/lib/naming/bulyong-hanja';
import type { Element } from '../src/types';

const ELEMENT_KO: Record<Element, string> = {
  wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
};

const SANGSAENG: Record<Element, Element> = {
  water: 'wood', wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water',
};

console.log('=== 사주 분석 ===\n');

const dadSaju = calculateSaju('1991-12-14');
console.log(`아빠 (1991.12.14):`);
console.log(`  일간: ${dadSaju.dayPillar.heavenlyStem} (${ELEMENT_KO[dadSaju.dayPillar.element]})`);
console.log(`  주요 오행: ${ELEMENT_KO[dadSaju.mainElement]}`);
console.log(`  부족 오행: ${ELEMENT_KO[dadSaju.lackingElement]}`);
console.log(`  강한 오행: ${dadSaju.strongElements.map(e => ELEMENT_KO[e]).join(', ')}`);
console.log(`  약한 오행: ${dadSaju.weakElements.map(e => ELEMENT_KO[e]).join(', ')}`);
console.log();

const momSaju = calculateSaju('1994-07-15');
console.log(`엄마 (1994.07.15):`);
console.log(`  일간: ${momSaju.dayPillar.heavenlyStem} (${ELEMENT_KO[momSaju.dayPillar.element]})`);
console.log(`  주요 오행: ${ELEMENT_KO[momSaju.mainElement]}`);
console.log(`  부족 오행: ${ELEMENT_KO[momSaju.lackingElement]}`);
console.log();

const babySaju = calculateSaju('2024-01-03');
console.log(`아이 (2024.01.03):`);
console.log(`  일간: ${babySaju.dayPillar.heavenlyStem} (${ELEMENT_KO[babySaju.dayPillar.element]})`);
console.log(`  주요 오행: ${ELEMENT_KO[babySaju.mainElement]}`);
console.log(`  부족 오행(용신): ${ELEMENT_KO[babySaju.lackingElement]}`);
console.log(`  강한 오행: ${babySaju.strongElements.map(e => ELEMENT_KO[e]).join(', ')}`);
console.log(`  약한 오행: ${babySaju.weakElements.map(e => ELEMENT_KO[e]).join(', ')}`);
console.log();

// 용신 기반 한자 추천
const yongshin = babySaju.lackingElement;
const complement = SANGSAENG[yongshin]; // 용신을 생하는 오행
console.log(`=== 용신 분석 ===`);
console.log(`용신(보완 필요 오행): ${ELEMENT_KO[yongshin]}`);
console.log(`용신을 생하는 오행: ${ELEMENT_KO[complement]}\n`);

const recs = recommendJawonHanja(yongshin, 'M');
console.log(`=== 자원오행 추천 한자 (용신 ${ELEMENT_KO[yongshin]} 직접 보완) ===`);
console.log(recs.primary.slice(0, 15).map(h => `${h.hanja}(${h.reading}) - ${h.meaning}`).join('\n'));
console.log();
console.log(`=== 자원오행 추천 한자 (${ELEMENT_KO[complement]} → 용신 상생) ===`);
console.log(recs.supporting.slice(0, 10).map(h => `${h.hanja}(${h.reading}) - ${h.meaning}`).join('\n'));
console.log();

// 자원오행 분석 예시
console.log(`=== 자원오행 분석 예시 ===`);
const testNames = [
  { name: '서준', hanja: ['瑞', '俊'] },
  { name: '민준', hanja: ['民', '俊'] },
  { name: '도윤', hanja: ['道', '潤'] },
  { name: '시우', hanja: ['時', '宇'] },
  { name: '하준', hanja: ['河', '俊'] },
];
for (const t of testNames) {
  const jawon = analyzeJawonOheng(t.hanja, yongshin);
  const bulyong = validateBulyong(t.hanja);
  console.log(`${t.name}(${t.hanja.join('')}): 자원오행=${jawon.elements.map(e => e ? ELEMENT_KO[e] : '미분류').join('+')} | 용신매치=${jawon.matchCount} | 점수=${jawon.score} | 불용=${bulyong.passed ? 'OK' : 'NG'}`);
}
