// @ts-ignore — lunar-javascript has no type definitions
import { Lunar } from 'lunar-javascript';
import { LUNAR_FESTIVALS, getFestivalByKey, getFestivalBonus } from '../constants/festivals';
import { getLunarInfo } from '../lib/lunarHelper';

// Convert a lunar date to a solar Date (noon, to avoid timezone edge effects)
function solarDateOfLunar(lunarYear: number, lunarMonth: number, lunarDay: number): Date {
  const solar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay).getSolar();
  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), 12);
}

describe('festivals table', () => {
  it('contains the two caishen days with max bonus', () => {
    expect(LUNAR_FESTIVALS['正月初五']).toEqual({ name: '迎财神', bonus: 3, isCaishenDay: true });
    expect(LUNAR_FESTIVALS['七月廿二']).toEqual({ name: '财神节', bonus: 3, isCaishenDay: true });
  });

  it('春节 has bonus 2, minor festivals bonus 1', () => {
    expect(getFestivalBonus('春节')).toBe(2);
    expect(getFestivalBonus('元宵节')).toBe(1);
    expect(getFestivalBonus('腊八节')).toBe(1);
  });

  it('unknown or null festival gives bonus 0', () => {
    expect(getFestivalBonus(null)).toBe(0);
    expect(getFestivalBonus('不存在的节日')).toBe(0);
  });

  it('getFestivalByKey returns null for non-festival keys', () => {
    expect(getFestivalByKey('三月初三')).toBeNull();
  });
});

describe('getLunarInfo festival detection', () => {
  it('detects 迎财神 on 正月初五', () => {
    const info = getLunarInfo(solarDateOfLunar(2026, 1, 5));
    expect(info.festival).toBe('迎财神');
    expect(info.isCaishenDay).toBe(true);
  });

  it('detects 财神节 on 七月廿二', () => {
    const info = getLunarInfo(solarDateOfLunar(2026, 7, 22));
    expect(info.festival).toBe('财神节');
    expect(info.isCaishenDay).toBe(true);
  });

  it('detects 春节 on 正月初一', () => {
    const info = getLunarInfo(solarDateOfLunar(2026, 1, 1));
    expect(info.festival).toBe('春节');
    expect(info.isCaishenDay).toBe(false);
  });

  it('returns null festival on an ordinary day', () => {
    const info = getLunarInfo(solarDateOfLunar(2026, 3, 3));
    expect(info.festival).toBeNull();
    expect(info.isCaishenDay).toBe(false);
  });

  it('handles leap month dates without crashing (2025 闰六月)', () => {
    const info = getLunarInfo(solarDateOfLunar(2025, -6, 1));
    expect(info.day).toBe(1);
    expect(info.festival).toBeNull();
  });
});
