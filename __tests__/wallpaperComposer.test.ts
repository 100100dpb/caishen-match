// @ts-ignore — lunar-javascript has no type definitions
import { Lunar } from 'lunar-javascript';
import { composeParams, WALLPAPER_WIDTH, WALLPAPER_HEIGHT } from '../lib/wallpaperComposer';
import { GODS, GOD_LIST } from '../constants/gods';

function solarDateOfLunar(lunarYear: number, lunarMonth: number, lunarDay: number): Date {
  const solar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay).getSolar();
  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), 12);
}

const ORDINARY_DAY = solarDateOfLunar(2026, 3, 3); // 非节日
const CAISHEN_DAY = solarDateOfLunar(2026, 1, 5); // 迎财神

describe('composeParams', () => {
  it('is deterministic — same god and date give identical params', () => {
    expect(composeParams('zhao', ORDINARY_DAY)).toEqual(composeParams('zhao', ORDINARY_DAY));
  });

  it('picks blessing from the god own pool', () => {
    GOD_LIST.forEach(god => {
      const params = composeParams(god.id, ORDINARY_DAY);
      expect(god.blessing).toContain(params.blessing);
    });
  });

  it('gradient has 3 color stops in hex format', () => {
    const params = composeParams('guan', ORDINARY_DAY);
    expect(params.bgGradient).toHaveLength(3);
    params.bgGradient.forEach(c => expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/));
  });

  it('ordinary days use element palette — different elements differ', () => {
    const fire = composeParams('hongcaishen', ORDINARY_DAY); // fire
    const water = composeParams('bigan', ORDINARY_DAY); // water
    expect(fire.bgGradient).not.toEqual(water.bgGradient);
  });

  it('same element gods share the palette on ordinary days', () => {
    const a = composeParams('bigan', ORDINARY_DAY); // water
    const b = composeParams('liuhai', ORDINARY_DAY); // water
    expect(a.bgGradient).toEqual(b.bgGradient);
  });

  it('festival palette overrides element palette on 迎财神', () => {
    const festival = composeParams('bigan', CAISHEN_DAY);
    const ordinary = composeParams('bigan', ORDINARY_DAY);
    expect(festival.festivalText).toBe('迎财神');
    expect(festival.bgGradient).not.toEqual(ordinary.bgGradient);
  });

  it('festivalText is null on ordinary days', () => {
    expect(composeParams('zhao', ORDINARY_DAY).festivalText).toBeNull();
  });

  it('dateText contains 农历 and the correct lunar day', () => {
    const params = composeParams('zhao', CAISHEN_DAY);
    expect(params.dateText).toContain('农历');
    expect(params.dateText).toContain('初五');
  });

  it('accent color matches the god color', () => {
    expect(composeParams('guan', ORDINARY_DAY).accentColor).toBe(GODS.guan.color);
  });

  it('export dimensions are iPhone 15 Pro Max resolution', () => {
    expect(WALLPAPER_WIDTH).toBe(1290);
    expect(WALLPAPER_HEIGHT).toBe(2796);
  });
});
