// @ts-ignore — lunar-javascript has no type definitions
import { Lunar } from 'lunar-javascript';
import { recommendToday, toDateKey } from '../lib/recommender';
import { GODS, GOD_LIST } from '../constants/gods';
import { GodScore } from '../lib/godMatcher';

function solarDateOfLunar(lunarYear: number, lunarMonth: number, lunarDay: number): Date {
  const solar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay).getSolar();
  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), 12);
}

const RANKING: GodScore[] = [
  { godId: 'fulushou', god: GODS.fulushou, score: 20, matchPercent: 95 },
  { godId: 'heguan', god: GODS.heguan, score: 16, matchPercent: 88 },
  { godId: 'zhongkui', god: GODS.zhongkui, score: 12, matchPercent: 80 },
  { godId: 'lvdu', god: GODS.lvdu, score: 8, matchPercent: 72 },
  { godId: 'zadji', god: GODS.zadji, score: 4, matchPercent: 65 },
];

const ORDINARY_DAY = solarDateOfLunar(2026, 3, 3);
const CAISHEN_DAY = solarDateOfLunar(2026, 1, 5);

describe('recommendToday', () => {
  it('returns all gods ranked, a quiz-matched god leads on an ordinary day', () => {
    const recs = recommendToday(RANKING, ORDINARY_DAY);
    expect(recs).toHaveLength(GOD_LIST.length);
    // Element harmony (+20/-10) may reorder close ranks, but an unranked god
    // (max +20) can never beat rank-1 base 40 minus worst-case -10
    const rankedIds = RANKING.map(r => r.godId);
    expect(rankedIds).toContain(recs[0].godId);
    // Quiz top god stays near the top even on unfavorable element days
    const topIndex = recs.findIndex(r => r.godId === 'fulushou');
    expect(topIndex).toBeLessThanOrEqual(2);
  });

  it('is deterministic for the same inputs', () => {
    expect(recommendToday(RANKING, ORDINARY_DAY)).toEqual(recommendToday(RANKING, ORDINARY_DAY));
  });

  it('迎财神 boosts the five-way gods relative to the previous day', () => {
    const before = recommendToday(RANKING, solarDateOfLunar(2026, 1, 4));
    const onDay = recommendToday(RANKING, CAISHEN_DAY);

    const scoreOf = (recs: ReturnType<typeof recommendToday>, id: string) =>
      recs.find(r => r.godId === id)!.score;

    // zhao is a boosted god and not in the user ranking — its score must jump by 20
    expect(scoreOf(onDay, 'zhao')).toBeGreaterThan(scoreOf(before, 'zhao'));
    // fulushou is not boosted — festival itself adds nothing for it
    const reasons = onDay.find(r => r.godId === 'fulushou')!.reasons;
    expect(reasons).not.toContain('迎财神');
    expect(onDay.find(r => r.godId === 'zhao')!.reasons).toContain('迎财神');
  });

  it('worship days add the lunar-day reason to all gods', () => {
    const day15 = recommendToday(RANKING, solarDateOfLunar(2026, 3, 15));
    day15.forEach(rec => {
      expect(rec.reasons).toContain('十五上香日');
    });
  });

  it('element harmony: day gan element generating a god element adds the 相生 reason', () => {
    // Scan a month of days — the five day-gan elements all occur, so 相生 must appear
    const found = Array.from({ length: 30 }, (_, i) =>
      recommendToday(RANKING, new Date(2026, 6, i + 1, 12))
    ).some(recs => recs.some(r => r.reasons.some(reason => reason.includes('生'))));
    expect(found).toBe(true);
  });

  it('works with an empty ranking (quiz not taken) without throwing', () => {
    const recs = recommendToday([], ORDINARY_DAY);
    expect(recs).toHaveLength(GOD_LIST.length);
    expect(recs[0].score).toBeGreaterThanOrEqual(recs[recs.length - 1].score);
  });

  it('same-score gods tie-break deterministically by godId', () => {
    const recs = recommendToday([], ORDINARY_DAY);
    for (let i = 1; i < recs.length; i++) {
      if (recs[i - 1].score === recs[i].score) {
        expect(recs[i - 1].godId.localeCompare(recs[i].godId)).toBeLessThan(0);
      }
    }
  });
});

describe('toDateKey', () => {
  it('formats as YYYY-MM-DD with zero padding', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});
