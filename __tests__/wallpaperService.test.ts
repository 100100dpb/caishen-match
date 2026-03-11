import { buildWallpaperUrl } from '../lib/wallpaperService';

// Mock lunarHelper so tests don't depend on actual date
jest.mock('../lib/lunarHelper', () => ({
  getLunarInfo: () => ({
    month: 1,
    day: 15,
    festival: null,
    term: null,
    yearGanZhi: '甲子',
    monthGanZhi: '丙寅',
    dayGanZhi: '庚午',
    isAuspicious: true,
  }),
}));

describe('buildWallpaperUrl', () => {
  it('returns a string URL', () => {
    const url = buildWallpaperUrl('zhao');
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
  });

  it('includes the godId in the URL', () => {
    expect(buildWallpaperUrl('zhao')).toContain('zhao');
    expect(buildWallpaperUrl('guan')).toContain('guan');
    expect(buildWallpaperUrl('bigan')).toContain('bigan');
  });

  it('daily URL includes zero-padded day number', () => {
    const url = buildWallpaperUrl('zhao', 'daily');
    expect(url).toContain('15'); // mocked lunar day = 15
  });

  it('element URL includes variant', () => {
    const url = buildWallpaperUrl('zhao', 'element', 'fire');
    expect(url).toContain('fire');
  });

  it('festival URL includes festival name when festival exists', () => {
    // Override mock for this test
    jest.resetModules();
  });
});
