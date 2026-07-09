import { getLunarInfo, getLunarDayBonus } from '../lib/lunarHelper';

const FIXED_DATE = new Date(2026, 6, 9, 12); // 2026-07-09 noon

describe('getLunarInfo', () => {
  it('returns yi/ji as non-empty string arrays', () => {
    const info = getLunarInfo(FIXED_DATE);
    expect(Array.isArray(info.yi)).toBe(true);
    expect(Array.isArray(info.ji)).toBe(true);
    expect(info.yi.length).toBeGreaterThan(0);
    expect(info.ji.length).toBeGreaterThan(0);
    info.yi.forEach(item => expect(typeof item).toBe('string'));
    info.ji.forEach(item => expect(typeof item).toBe('string'));
  });

  it('isAuspicious reflects 宜祭祀 in the yi list', () => {
    const info = getLunarInfo(FIXED_DATE);
    expect(info.isAuspicious).toBe(info.yi.some(item => item.includes('祭祀')));
  });

  it('produces both true and false auspicious days across a month', () => {
    const values = new Set<boolean>();
    for (let d = 1; d <= 30; d++) {
      values.add(getLunarInfo(new Date(2026, 6, d, 12)).isAuspicious);
    }
    expect(values.size).toBe(2); // 宜祭祀 must vary — the old logic was always true
  });

  it('ganzhi strings are two characters', () => {
    const info = getLunarInfo(FIXED_DATE);
    expect(info.yearGanZhi).toHaveLength(2);
    expect(info.monthGanZhi).toHaveLength(2);
    expect(info.dayGanZhi).toHaveLength(2);
  });

  it('is deterministic for the same date', () => {
    expect(getLunarInfo(FIXED_DATE)).toEqual(getLunarInfo(new Date(2026, 6, 9, 12)));
  });
});

describe('getLunarDayBonus', () => {
  it('major worship days score 2', () => {
    [1, 2, 15, 16].forEach(d => expect(getLunarDayBonus(d)).toBe(2));
  });

  it('lucky business days score 1', () => {
    [8, 18, 28].forEach(d => expect(getLunarDayBonus(d)).toBe(1));
  });

  it('ordinary days score 0', () => {
    [3, 7, 12, 20, 27, 30].forEach(d => expect(getLunarDayBonus(d)).toBe(0));
  });
});
