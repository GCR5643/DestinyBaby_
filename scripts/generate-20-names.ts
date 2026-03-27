/**
 * 이름 20개 생성 테스트
 * 실행: npx tsx scripts/generate-20-names.ts
 */
import { calculateSaju } from '../src/lib/saju/saju-calculator';
import { generateNames } from '../src/lib/naming/name-generator';
import { analyzeJawonOheng } from '../src/lib/naming/jawon-oheng';
import { validateBulyong } from '../src/lib/naming/bulyong-hanja';
import { analyzePronunciationOheng } from '../src/lib/naming/pronunciation-oheng';
import type { NamingInput, Element, SuggestedName } from '../src/types';

// dotenv - load .env.local manually
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

const ELEMENT_KO: Record<Element, string> = {
  wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)',
};

async function main() {
  const dadSaju = calculateSaju('1991-12-14');
  const momSaju = calculateSaju('1994-07-15');
  const babySaju = calculateSaju('2024-01-03');

  console.log(`\n아이 사주: 일간=${babySaju.dayPillar.heavenlyStem}(${ELEMENT_KO[babySaju.dayPillar.element]}), 용신=${ELEMENT_KO[babySaju.lackingElement]}\n`);

  const baseInput: NamingInput = {
    surname: '이',
    gender: 'male',
    babySaju: babySaju,
    parent1Saju: dadSaju,
    parent2Saju: momSaju,
  };

  const allNames: SuggestedName[] = [];
  const seen = new Set<string>();

  // 4라운드 (트렌디/밸런스/클래식 + 추가) 돌려서 20개 확보
  const rounds: Array<{ label: string; trendLevel: 'trendy' | 'balanced' | 'classic' }> = [
    { label: '트렌디', trendLevel: 'trendy' },
    { label: '밸런스', trendLevel: 'balanced' },
    { label: '클래식', trendLevel: 'classic' },
    { label: '밸런스2', trendLevel: 'balanced' },
  ];

  for (const round of rounds) {
    if (allNames.length >= 20) break;
    console.log(`[${round.label}] 이름 생성 중...`);
    try {
      const input: NamingInput = { ...baseInput, trendLevel: round.trendLevel };
      const names = await generateNames(input);
      for (const n of names) {
        if (!seen.has(n.hanja) && allNames.length < 20) {
          seen.add(n.hanja);
          allNames.push(n);
        }
      }
      console.log(`  → ${names.length}개 생성, 누적 ${allNames.length}개\n`);
    } catch (err) {
      console.error(`  → 실패:`, err instanceof Error ? err.message : err);
    }
  }

  // 추가 라운드 (부족하면)
  let extraRound = 0;
  while (allNames.length < 20 && extraRound < 3) {
    extraRound++;
    console.log(`[추가${extraRound}] 이름 생성 중...`);
    try {
      const names = await generateNames({ ...baseInput, trendLevel: 'balanced' });
      for (const n of names) {
        if (!seen.has(n.hanja) && allNames.length < 20) {
          seen.add(n.hanja);
          allNames.push(n);
        }
      }
      console.log(`  → 누적 ${allNames.length}개\n`);
    } catch (err) {
      console.error(`  → 실패:`, err instanceof Error ? err.message : err);
    }
  }

  // 결과 출력
  console.log(`\n${'='.repeat(80)}`);
  console.log(`이름 후보 ${allNames.length}개 (아빠 1991.12.14 / 엄마 1994.07.15 / 아들 2024.01.03)`);
  console.log(`아이 용신: ${ELEMENT_KO[babySaju.lackingElement]} | 일간: ${ELEMENT_KO[babySaju.dayPillar.element]}`);
  console.log(`${'='.repeat(80)}\n`);

  for (let i = 0; i < allNames.length; i++) {
    const n = allNames[i];
    const hanjaChars = n.hanja ? Array.from(n.hanja).slice(0) : [];
    // 성씨 제외한 이름 한자만
    const nameChars = hanjaChars.length > 0 ? hanjaChars : [];

    const jawon = nameChars.length > 0
      ? analyzeJawonOheng(nameChars, babySaju.lackingElement)
      : { score: 0, elements: [], matchCount: 0, generateCount: 0 };
    const bulyong = nameChars.length > 0 ? validateBulyong(nameChars) : { passed: true, score: 100, issues: [] };

    // 발음오행
    const fullName = `이${n.name}`;
    const pronResult = analyzePronunciationOheng('이', n.name);

    console.log(
      `${String(i + 1).padStart(2, ' ')}. 이${n.name} (${n.hanja || '-'})` +
      ` | 사주${n.sajuScore}점` +
      ` | 자원${jawon.score}점` +
      ` | 발음${pronResult.score}점` +
      ` | 불용${bulyong.passed ? 'OK' : 'NG'}`
    );
    console.log(`    ${n.reasonShort}`);
    console.log();
  }
}

main().catch(console.error);
