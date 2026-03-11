import { GodId, GODS, God } from '../constants/gods';
import { QUIZ_QUESTIONS, QuizOption } from '../constants/quiz';

export interface GodScore {
  godId: GodId;
  god: God;
  score: number;
  matchPercent: number;
}

export interface MatchResult {
  answers: number[][]; // questionIndex -> selected option indices
  topGods: GodScore[];
  favoredElement: string;
  primaryDesire: string;
}

export function calculateMatch(answers: Record<number, number>): MatchResult {
  const scores: Partial<Record<GodId, number>> = {};
  const elementCounts: Record<string, number> = {};
  const desireCounts: Record<string, number> = {};

  // Tally scores from each answer
  for (const [qIdx, optIdx] of Object.entries(answers)) {
    const question = QUIZ_QUESTIONS[Number(qIdx)];
    if (!question) continue;
    const option: QuizOption = question.options[optIdx];
    if (!option) continue;

    for (const [godId, pts] of Object.entries(option.godScores)) {
      scores[godId as GodId] = (scores[godId as GodId] || 0) + (pts as number);
    }
    if (option.element) {
      elementCounts[option.element] = (elementCounts[option.element] || 0) + 1;
    }
    if (option.desire) {
      desireCounts[option.desire] = (desireCounts[option.desire] || 0) + 1;
    }
  }

  // Get max possible score for normalization
  const maxScore = Math.max(...Object.values(scores).map(v => v || 0), 1);

  // Build ranked list
  const ranked: GodScore[] = Object.entries(GODS)
    .map(([id, god]) => ({
      godId: id as GodId,
      god,
      score: scores[id as GodId] || 0,
      matchPercent: Math.round(((scores[id as GodId] || 0) / maxScore) * 100),
    }))
    .sort((a, b) => b.score - a.score);

  const favoredElement =
    Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'earth';
  const primaryDesire =
    Object.entries(desireCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '财富';

  return {
    answers: [],
    topGods: ranked.slice(0, 5),
    favoredElement,
    primaryDesire,
  };
}
