import { calculateMatch } from '../lib/godMatcher';
import { GODS } from '../constants/gods';
import { QUIZ_QUESTIONS } from '../constants/quiz';

describe('calculateMatch', () => {
  it('returns topGods with length 5', () => {
    // Answer every question with option 0
    const answers: Record<number, number> = {};
    QUIZ_QUESTIONS.forEach((_, i) => { answers[i] = 0; });

    const result = calculateMatch(answers);
    expect(result.topGods).toHaveLength(5);
  });

  it('all matchPercent values are between 0 and 100', () => {
    const answers: Record<number, number> = {};
    QUIZ_QUESTIONS.forEach((_, i) => { answers[i] = 0; });

    const result = calculateMatch(answers);
    result.topGods.forEach(gs => {
      expect(gs.matchPercent).toBeGreaterThanOrEqual(0);
      expect(gs.matchPercent).toBeLessThanOrEqual(100);
    });
  });

  it('topGods are sorted by score descending', () => {
    const answers: Record<number, number> = {};
    QUIZ_QUESTIONS.forEach((_, i) => { answers[i] = 0; });

    const result = calculateMatch(answers);
    for (let i = 1; i < result.topGods.length; i++) {
      expect(result.topGods[i - 1].score).toBeGreaterThanOrEqual(result.topGods[i].score);
    }
  });

  it('returns a valid god object for each entry in topGods', () => {
    const answers: Record<number, number> = {};
    QUIZ_QUESTIONS.forEach((_, i) => { answers[i] = 0; });

    const result = calculateMatch(answers);
    result.topGods.forEach(gs => {
      expect(GODS[gs.godId]).toBeDefined();
      expect(gs.god).toBeDefined();
      expect(gs.god.name).toBeTruthy();
    });
  });

  it('investing-focused answers push bigan to top 2', () => {
    // Q0: 投资人 (idx 2), Q1: 投资 (idx 3), rest: 0
    const answers: Record<number, number> = {};
    QUIZ_QUESTIONS.forEach((_, i) => { answers[i] = 0; });
    answers[0] = 2; // 投资人
    answers[1] = 3; // 投资顺手

    const result = calculateMatch(answers);
    const biganRank = result.topGods.findIndex(g => g.godId === 'bigan');
    expect(biganRank).toBeLessThanOrEqual(1); // top 2
  });

  it('business-focused answers push guan or fanli to top 3', () => {
    const answers: Record<number, number> = {};
    QUIZ_QUESTIONS.forEach((_, i) => { answers[i] = 0; });
    answers[0] = 1; // 创业者
    answers[1] = 2; // 生意兴旺

    const result = calculateMatch(answers);
    const top3Ids = result.topGods.slice(0, 3).map(g => g.godId);
    expect(top3Ids.some(id => id === 'guan' || id === 'fanli')).toBe(true);
  });

  it('sets favoredElement to a valid element when element options are selected', () => {
    const answers: Record<number, number> = {};
    QUIZ_QUESTIONS.forEach((_, i) => { answers[i] = 0; });
    answers[2] = 1; // water element option

    const result = calculateMatch(answers);
    expect(['fire', 'water', 'wood', 'earth', 'metal']).toContain(result.favoredElement);
  });

  it('returns empty-answer result without throwing', () => {
    expect(() => calculateMatch({})).not.toThrow();
    const result = calculateMatch({});
    expect(result.topGods).toHaveLength(5);
  });
});
