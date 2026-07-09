import { classifyHex, detectColors, analyzeOutfit, hexToHsl } from '../lib/outfitAnalyzer';
import { GODS } from '../constants/gods';

describe('hexToHsl', () => {
  it('parses valid hex with or without #', () => {
    expect(hexToHsl('#FF0000')).toMatchObject({ h: 0, s: 1, l: 0.5 });
    expect(hexToHsl('00FF00')?.h).toBe(120);
  });

  it('returns null for invalid input', () => {
    expect(hexToHsl('red')).toBeNull();
    expect(hexToHsl('#FFF')).toBeNull();
    expect(hexToHsl('')).toBeNull();
  });
});

describe('classifyHex — color to five-element mapping', () => {
  const cases: Array<[string, string, string]> = [
    // [hex, 中文名, element]
    ['#D32F2F', '红色', 'fire'],
    ['#F57C00', '橙色', 'fire'],
    ['#8E24AA', '紫色', 'fire'],
    ['#EC5FA8', '粉色', 'fire'],
    ['#FBC02D', '黄色', 'earth'],
    ['#6D4C2F', '棕色', 'earth'],
    ['#FFFFFF', '白色', 'metal'],
    ['#B9B9BF', '银灰色', 'metal'],
    ['#111111', '黑色', 'water'],
    ['#16305E', '深蓝色', 'water'],
    ['#2196F3', '蓝色', 'water'],
    ['#43A047', '绿色', 'wood'],
  ];

  it.each(cases)('%s → %s (%s)', (hex, name, element) => {
    expect(classifyHex(hex)).toEqual({ name, element });
  });

  it('returns null for garbage input', () => {
    expect(classifyHex('not-a-color')).toBeNull();
  });
});

describe('detectColors', () => {
  it('dedupes colors that classify to the same name', () => {
    const colors = detectColors(['#D32F2F', '#C62828', '#43A047']); // 两个红 + 一个绿
    expect(colors).toHaveLength(2);
    expect(colors[0].name).toBe('红色');
    expect(colors[1].name).toBe('绿色');
  });

  it('caps at 3 colors with descending weights', () => {
    const colors = detectColors(['#D32F2F', '#43A047', '#2196F3', '#FBC02D']);
    expect(colors).toHaveLength(3);
    expect(colors[0].percentage).toBeGreaterThan(colors[1].percentage);
    expect(colors[1].percentage).toBeGreaterThan(colors[2].percentage);
  });

  it('skips invalid hexes', () => {
    expect(detectColors(['garbage', '#43A047'])).toHaveLength(1);
  });
});

describe('analyzeOutfit — verdict rules vs god element', () => {
  // guan 是金系财神
  const guan = GODS.guan;

  it('outfit element same as god element → good', () => {
    const result = analyzeOutfit(['#FFFFFF'], guan); // 白=金, 金金同气
    expect(result.verdict).toBe('good');
    expect(result.verdictText).toContain(guan.name);
  });

  it('outfit element generates god element → good', () => {
    const result = analyzeOutfit(['#FBC02D'], guan); // 黄=土, 土生金
    expect(result.verdict).toBe('good');
  });

  it('outfit element overcomes god element → clash', () => {
    const result = analyzeOutfit(['#D32F2F'], guan); // 红=火, 火克金
    expect(result.verdict).toBe('clash');
    expect(result.advice).toContain(guan.accessories[0]);
  });

  it('god element overcomes outfit element → clash', () => {
    const result = analyzeOutfit(['#43A047'], guan); // 绿=木, 金克木
    expect(result.verdict).toBe('clash');
  });

  it('god element generates outfit element → neutral', () => {
    const result = analyzeOutfit(['#2196F3'], guan); // 蓝=水, 金生水
    expect(result.verdict).toBe('neutral');
  });

  it('no usable colors → neutral with advice, does not throw', () => {
    const result = analyzeOutfit(['garbage'], guan);
    expect(result.verdict).toBe('neutral');
    expect(result.advice.length).toBeGreaterThan(0);
    expect(result.colors).toHaveLength(0);
  });

  it('every verdict comes with non-empty advice', () => {
    ['#FFFFFF', '#FBC02D', '#D32F2F', '#2196F3'].forEach(hex => {
      const result = analyzeOutfit([hex], guan);
      expect(result.advice.length).toBeGreaterThan(0);
      expect(result.verdictText.length).toBeGreaterThan(0);
    });
  });
});
