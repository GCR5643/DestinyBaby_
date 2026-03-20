import type { SajuResult, Card, Grade, Element } from '@/types';

const ELEMENT_GRADE_BOOST: Record<Element, Grade[]> = {
  wood: ['S', 'SS'],
  fire: ['SS', 'SSS'],
  earth: ['A', 'S'],
  metal: ['SSS', 'SS'],
  water: ['S', 'SS'],
};

export function calculateCardProbability(
  saju: SajuResult,
  baseProbabilities: Record<Grade, number>
): Record<Grade, number> {
  const boostedGrades = ELEMENT_GRADE_BOOST[saju.mainElement] || [];
  const modified = { ...baseProbabilities };

  boostedGrades.forEach(grade => {
    modified[grade] = (modified[grade] || 0) * 1.2;
  });

  // Normalize
  const total = Object.values(modified).reduce((a, b) => a + b, 0);
  Object.keys(modified).forEach(k => {
    modified[k as Grade] = modified[k as Grade] / total;
  });

  return modified;
}

export function selectCardGrade(probabilities: Record<Grade, number>, pityCount = 0): Grade {
  const grades: Grade[] = ['B', 'A', 'S', 'SS', 'SSS'];

  // Pity system
  if (pityCount >= 90) return 'SSS';
  if (pityCount >= 50) return 'SS';

  const random = Math.random();
  let cumulative = 0;

  for (const grade of grades) {
    cumulative += probabilities[grade] || 0;
    if (random <= cumulative) return grade;
  }

  return 'B';
}
