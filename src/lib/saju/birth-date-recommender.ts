import type { SajuResult, Element } from '@/types';
import { calculateSaju } from './saju-calculator';
import { getElementRelationship } from './saju-calculator';

interface RecommendedDate {
  date: string;
  score: number;
  reason: string;
  luckyElement: Element;
}

export function recommendBirthDates(
  parent1Saju: SajuResult,
  parent2Saju?: SajuResult,
  startDate?: Date,
  count = 5
): RecommendedDate[] {
  const recommendations: RecommendedDate[] = [];
  const base = startDate || new Date();

  // Check next 365 days
  for (let i = 0; i < 365 && recommendations.length < count * 3; i++) {
    const date = new Date(base);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const daySaju = calculateSaju(dateStr);
    let score = 70;

    const p1Relation = getElementRelationship(parent1Saju.lackingElement, daySaju.mainElement);
    if (p1Relation === 'generates') score += 15;

    if (parent2Saju) {
      const p2Relation = getElementRelationship(parent2Saju.lackingElement, daySaju.mainElement);
      if (p2Relation === 'generates') score += 10;
    }

    // Bonus for auspicious days
    if (daySaju.dayPillar.yin_yang !== daySaju.yearPillar.yin_yang) score += 5;

    if (score >= 85) {
      recommendations.push({
        date: dateStr,
        score,
        reason: `${daySaju.mainElement} 기운이 강한 날로 균형 잡힌 사주를 형성합니다`,
        luckyElement: daySaju.mainElement,
      });
    }
  }

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
