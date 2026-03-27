/**
 * 리포트 생성 테스트: 이현우(賢佑)
 * 실행: npx tsx scripts/test-report.ts
 */
import { readFileSync } from 'fs';
try {
  const envContent = readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch { /* ignore */ }

import { calculateSaju } from '../src/lib/saju/saju-calculator';
import { analyzeName } from '../src/lib/naming/name-analyzer';
import type { Element } from '../src/types';

const ELEMENT_KO: Record<Element, string> = {
  wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
};

async function main() {
  console.log('=== 이현우(賢佑) 작명 리포트 생성 테스트 ===\n');

  const dadSaju = calculateSaju('1991-12-14');
  const momSaju = calculateSaju('1994-07-15');
  const babySaju = calculateSaju('2024-01-03');

  console.log(`아이 사주: 일간=${ELEMENT_KO[babySaju.dayPillar.element]}, 용신=${ELEMENT_KO[babySaju.lackingElement]}\n`);

  console.log('리포트 생성 중... (LLM 호출)\n');

  const report = await analyzeName(
    '현우',      // name (이름만)
    '賢佑',      // hanja (이름 한자만)
    babySaju,    // baby saju
    dadSaju,     // parent1
    momSaju,     // parent2
    '이',        // surname
  );

  console.log('=== 리포트 결과 ===\n');

  // 1. 전문가 종합 점수
  console.log(`📊 전문가 종합 점수: ${report.expertScore ?? '미산출'}점`);
  console.log(`   사주 적합도: ${report.sajuFitScore}점`);
  console.log(`   부모 궁합: 엄마 ${report.parentCompatibility.mom}점 / 아빠 ${report.parentCompatibility.dad}점 / 종합 ${report.parentCompatibility.combined}점`);
  console.log();

  // 2. 자원오행
  if (report.jawonOheng) {
    const j = report.jawonOheng;
    console.log(`🔮 자원오행 분석 (가중치 40%):`);
    console.log(`   한자별 오행: ${j.elements.map(e => e ? ELEMENT_KO[e] : '미분류').join(' + ')}`);
    console.log(`   용신 직접 매치: ${j.matchCount}개`);
    console.log(`   상생 보완: ${j.generateCount}개`);
    console.log(`   자원오행 점수: ${j.score}점`);
    console.log();
  }

  // 3. 불용한자
  if (report.bulyongCheck) {
    const b = report.bulyongCheck;
    console.log(`⚠️ 불용한자 검사: ${b.passed ? '✅ 통과' : '❌ 위반'}`);
    if (b.issues.length > 0) {
      console.log(`   문제 한자: ${b.issues.map(i => `${i.hanja}(${i.reading}) - ${i.reason}`).join(', ')}`);
    }
    console.log(`   불용 점수: ${b.score}점`);
    console.log();
  }

  // 4. 발음오행
  if (report.pronunciationOheng) {
    const p = report.pronunciationOheng;
    console.log(`🔊 발음오행 분석 (가중치 25%):`);
    console.log(`   점수: ${p.score}점`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log(`   조화: ${(p as any).harmony ?? '-'}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log(`   설명: ${(p as any).comment ?? '-'}`);
    console.log();
  }

  // 5. 수리오행 (5격)
  const s = report.strokeAnalysis;
  console.log(`📐 수리오행 5격 분석 (가중치 20%):`);
  console.log(`   천격: ${s.heavenGrade} | 인격: ${s.humanGrade} | 지격: ${s.earthGrade} | 외격: ${s.outerGrade} | 총격: ${s.totalGrade}`);
  console.log(`   운세점수: ${s.luckScore}점`);
  console.log();

  // 6. 음양배합
  if (report.eumyangAnalysis) {
    const e = report.eumyangAnalysis;
    console.log(`☯️ 음양배합 분석 (가중치 10%):`);
    console.log(`   패턴: ${e.pattern} | 운: ${e.luck}`);
    console.log(`   점수: ${e.score}점`);
    console.log(`   설명: ${e.description}`);
    console.log();
  }

  // 7. 한자 풀이
  console.log(`📖 이름 한자 풀이:`);
  for (const m of report.meaningBreakdown) {
    console.log(`   ${m.hanja}(${m.char}): ${m.meaning}`);
  }
  console.log();

  // 8. 종합 소견
  console.log(`💬 종합 소견:`);
  console.log(`   ${report.overallComment}`);
  console.log();

  // 9. 오행 분석
  console.log(`🌐 오행 분석:`);
  console.log(`   요소: ${report.yinYangFiveElements.elements.map(e => ELEMENT_KO[e as Element]).join(', ')}`);
  console.log(`   균형: ${report.yinYangFiveElements.balance}`);
  console.log(`   추천: ${report.yinYangFiveElements.recommendation}`);
}

main().catch(console.error);
