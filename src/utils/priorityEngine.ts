import { EmergencyCategory, PriorityLevel } from '../types';

export interface PriorityScoreBreakdown {
  score: number;
  level: PriorityLevel;
  reasons: string[];
}

export function calculatePriorityScore(
  category: EmergencyCategory,
  headcount: number,
  needs: string[],
  medicalDetails?: string,
  isIsolated?: boolean
): PriorityScoreBreakdown {
  let score = 20; // baseline
  const reasons: string[] = [];

  // Category & Needs Weight
  if (category === 'Medical Emergency' || needs.includes('Medical Emergency')) {
    score += 35;
    reasons.push('High-acuity medical emergency (Direct life threat)');
  }
  if (category === 'Flooding / Trapped' || needs.includes('Rescue Boat Required')) {
    score += 30;
    reasons.push('Active flood inundation / water rescue required');
  }
  if (category === 'Drinking Water' || needs.includes('Drinking Water')) {
    score += 15;
    reasons.push('Dehydration risk / potable water shortage');
  }
  if (category === 'Food Supply' || needs.includes('Food Supply')) {
    score += 10;
    reasons.push('Sustenance deprivation risk');
  }

  // Headcount Factor
  if (headcount > 10) {
    score += 25;
    reasons.push(`Mass headcount affected (${headcount} people)`);
  } else if (headcount >= 5) {
    score += 15;
    reasons.push(`Multi-person family trapped (${headcount} people)`);
  } else if (headcount >= 2) {
    score += 8;
    reasons.push(`Household group (${headcount} people)`);
  }

  // Specific Medical Details
  if (medicalDetails && medicalDetails.trim().length > 5) {
    score += 12;
    reasons.push('Specific clinical vulnerability documented (e.g. elderly, infant, chronic illness)');
  }

  // Isolation Risk
  if (isIsolated) {
    score += 18;
    reasons.push('🔴 CRITICAL: Community is in a dual-isolated zone (Cut off from roads & cell signal)');
  }

  // Clamp 0-100
  const finalScore = Math.min(100, Math.max(10, score));

  let level: PriorityLevel = 'Moderate';
  if (finalScore >= 85) level = 'Critical';
  else if (finalScore >= 70) level = 'Urgent';
  else if (finalScore >= 50) level = 'High';
  else if (finalScore >= 35) level = 'Moderate';
  else level = 'Low';

  return {
    score: finalScore,
    level,
    reasons,
  };
}
