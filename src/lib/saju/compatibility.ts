import type { SajuResult } from '@/types';
import { getElementRelationship } from './saju-calculator';

export interface CompatibilityResult {
  score: number;
  level: 'excellent' | 'good' | 'average' | 'poor';
  aspects: { title: string; score: number; comment: string }[];
  overallComment: string;
}

export function analyzeCompatibility(saju1: SajuResult, saju2: SajuResult): CompatibilityResult {
  let score = 0;
  const aspects = [];

  // Element compatibility
  const elemRelation = getElementRelationship(saju1.mainElement, saju2.mainElement);
  const elemScore = elemRelation === 'generates' ? 90 : elemRelation === 'neutral' ? 70 : 50;
  score += elemScore * 0.4;
  aspects.push({
    title: '오행 궁합',
    score: elemScore,
    comment: elemRelation === 'generates'
      ? '서로의 기운이 잘 맞아 조화를 이룹니다'
      : elemRelation === 'neutral'
      ? '서로 무난한 관계입니다'
      : '서로 보완이 필요한 관계입니다',
  });

  // Year pillar compatibility
  const yearScore = saju1.yearPillar.yin_yang !== saju2.yearPillar.yin_yang ? 85 : 65;
  score += yearScore * 0.3;
  aspects.push({
    title: '연주 궁합',
    score: yearScore,
    comment: yearScore > 80 ? '음양이 조화롭습니다' : '비슷한 기질을 가지고 있습니다',
  });

  // Energy level
  const energyDiff = Math.abs(saju1.overallEnergy - saju2.overallEnergy);
  const energyScore = Math.max(60, 100 - energyDiff * 2);
  score += energyScore * 0.3;
  aspects.push({
    title: '기운 균형',
    score: energyScore,
    comment: energyDiff < 10 ? '비슷한 에너지를 가지고 있습니다' : '서로 다른 에너지가 보완됩니다',
  });

  const totalScore = Math.round(score);
  const level = totalScore >= 85 ? 'excellent' : totalScore >= 70 ? 'good' : totalScore >= 55 ? 'average' : 'poor';

  return {
    score: totalScore,
    level,
    aspects,
    overallComment: level === 'excellent'
      ? '천생연분입니다! 서로를 더욱 빛나게 해주는 최고의 궁합이에요.'
      : level === 'good'
      ? '좋은 궁합이에요. 서로 이해하고 배려하면 행복한 관계가 될 수 있어요.'
      : level === 'average'
      ? '노력이 필요하지만 충분히 좋은 관계를 만들 수 있어요.'
      : '서로의 차이를 이해하고 소통한다면 더 성장할 수 있는 관계에요.',
  };
}
