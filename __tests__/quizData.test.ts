import { QUIZ_QUESTIONS } from '../constants/quiz';
import { GODS } from '../constants/gods';

describe('quiz questions', () => {
  it('has exactly 7 questions', () => {
    expect(QUIZ_QUESTIONS).toHaveLength(7);
  });

  it('questions are numbered 1 through 7', () => {
    QUIZ_QUESTIONS.forEach((q, i) => {
      expect(q.id).toBe(i + 1);
    });
  });

  it('every question has a title and at least 2 options', () => {
    QUIZ_QUESTIONS.forEach(q => {
      expect(q.title).toBeTruthy();
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('every option has text and godScores', () => {
    QUIZ_QUESTIONS.forEach(q => {
      q.options.forEach(opt => {
        expect(opt.text).toBeTruthy();
        expect(typeof opt.godScores).toBe('object');
      });
    });
  });

  it('all godScore keys reference valid god ids', () => {
    const validIds = new Set(Object.keys(GODS));
    QUIZ_QUESTIONS.forEach(q => {
      q.options.forEach(opt => {
        Object.keys(opt.godScores).forEach(id => {
          expect(validIds.has(id)).toBe(true);
        });
      });
    });
  });

  it('all godScore values are positive numbers', () => {
    QUIZ_QUESTIONS.forEach(q => {
      q.options.forEach(opt => {
        Object.values(opt.godScores).forEach(score => {
          expect(score).toBeGreaterThan(0);
        });
      });
    });
  });

  it('element options use valid element values when present', () => {
    const validElements = new Set(['fire', 'water', 'wood', 'earth', 'metal']);
    QUIZ_QUESTIONS.forEach(q => {
      q.options.forEach(opt => {
        if (opt.element) {
          expect(validElements.has(opt.element)).toBe(true);
        }
      });
    });
  });
});
