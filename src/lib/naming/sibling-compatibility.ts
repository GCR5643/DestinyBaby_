import type { SiblingCompatibility, SajuResult } from '@/types';
import { getElementRelationship } from '@/lib/saju/saju-calculator';

export function analyzeSiblingCompatibility(
  sibling1Saju: SajuResult,
  parent1Saju: SajuResult,
  _parent2Saju?: SajuResult
): SiblingCompatibility {
  const elemRelation = getElementRelationship(sibling1Saju.mainElement, parent1Saju.mainElement);

  const compatibilityScore = elemRelation === 'generates' ? 88 : elemRelation === 'neutral' ? 74 : 62;

  const optimalMonths = getOptimalBirthMonths(sibling1Saju);

  return {
    compatibilityScore,
    positiveAspects: [
      '형제 사이의 오행이 서로를 도와줍니다',
      '부모님의 기운을 잘 이어받을 것입니다',
      '건강하고 밝은 관계를 형성할 것입니다',
    ],
    challenges: [
      '가끔 경쟁심이 생길 수 있어요',
      '서로의 개성을 존중하는 것이 중요합니다',
    ],
    optimalBirthPeriods: optimalMonths,
    overallComment: compatibilityScore >= 80
      ? '형제 사이의 궁합이 매우 좋습니다! 서로를 응원하고 성장시키는 좋은 관계가 될 거예요.'
      : '서로 다른 매력으로 균형을 이루는 형제가 될 거예요.',
  };
}

function getOptimalBirthMonths(sibling1Saju: SajuResult): string[] {
  const elementMonths: Record<string, string[]> = {
    wood: ['3월 (봄)', '4월 (봄)', '5월 (봄)'],
    fire: ['6월 (여름)', '7월 (여름)'],
    earth: ['3월', '6월', '9월', '12월'],
    metal: ['9월 (가을)', '10월 (가을)'],
    water: ['11월 (겨울)', '12월 (겨울)', '1월 (겨울)'],
  };
  return elementMonths[sibling1Saju.lackingElement] || ['봄', '여름'];
}
