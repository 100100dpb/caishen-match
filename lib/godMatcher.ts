import { GodId, GODS, God } from '../constants/gods';
import { QUIZ_QUESTIONS, QuizOption } from '../constants/quiz';

export interface GodScore {
  godId: GodId;
  god: God;
  score: number;
  matchPercent: number;
}

export interface MatchResult {
  topGods: GodScore[];
  favoredElement: string;
  primaryDesire: string;
}

// 匹配度映射区间：永不满分（保持神秘感），Top5 间有可见差距
const PERCENT_MIN = 62;
const PERCENT_MAX = 98;

// 每位财神在题库中的理论最高分（每题取该财神能拿到的最高选项分之和）
function getMaxPossibleScores(): Record<GodId, number> {
  const max: Partial<Record<GodId, number>> = {};
  for (const question of QUIZ_QUESTIONS) {
    const perQuestionBest: Partial<Record<GodId, number>> = {};
    for (const option of question.options) {
      for (const [godId, pts] of Object.entries(option.godScores)) {
        const id = godId as GodId;
        perQuestionBest[id] = Math.max(perQuestionBest[id] || 0, pts as number);
      }
    }
    for (const [godId, pts] of Object.entries(perQuestionBest)) {
      const id = godId as GodId;
      max[id] = (max[id] || 0) + (pts as number);
    }
  }
  return max as Record<GodId, number>;
}

const MAX_POSSIBLE = getMaxPossibleScores();

function toMatchPercent(score: number, godId: GodId): number {
  const maxPossible = MAX_POSSIBLE[godId] || 0;
  if (maxPossible === 0) return PERCENT_MIN;
  const ratio = Math.min(score / maxPossible, 1);
  return PERCENT_MIN + Math.round(ratio * (PERCENT_MAX - PERCENT_MIN));
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

  // Build ranked list
  const ranked: GodScore[] = Object.entries(GODS)
    .map(([id, god]) => ({
      godId: id as GodId,
      god,
      score: scores[id as GodId] || 0,
      matchPercent: toMatchPercent(scores[id as GodId] || 0, id as GodId),
    }))
    .sort((a, b) => b.score - a.score || a.godId.localeCompare(b.godId));

  const favoredElement =
    Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'earth';
  const primaryDesire =
    Object.entries(desireCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '财富';

  return {
    topGods: ranked.slice(0, 5),
    favoredElement,
    primaryDesire,
  };
}
