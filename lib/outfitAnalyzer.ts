import { Element, God } from '../constants/gods';
import { GENERATES, ELEMENT_CN, relation } from './wuxing';
import { ELEMENT_WEAR_COLORS, VERDICT_TEMPLATES, ADVICE_TEMPLATES } from '../constants/advice';

export interface DetectedColor {
  hex: string;
  name: string; // 中文颜色名
  element: Element;
  percentage: number; // 主次权重（非真实占比）
}

export type Verdict = 'good' | 'neutral' | 'clash';

export interface OutfitAnalysis {
  colors: DetectedColor[];
  verdict: Verdict;
  verdictText: string;
  advice: string;
}

interface HSL {
  h: number; // 0-360
  s: number; // 0-1
  l: number; // 0-1
}

export function hexToHsl(hex: string): HSL | null {
  const m = hex.trim().match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return { h: 0, s: 0, l };

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;

  return { h, s, l };
}

// 颜色 → 五行映射（设计文档第六章规则）：
// 红/橙/紫/粉→火  黄/棕→土  白/银/灰→金  黑/深蓝→水  绿→木
export function classifyHex(hex: string): { name: string; element: Element } | null {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  const { h, s, l } = hsl;

  if (l < 0.16) return { name: '黑色', element: 'water' };
  if (l > 0.92 && s < 0.3) return { name: '白色', element: 'metal' };
  if (s < 0.12) return { name: l > 0.6 ? '银灰色' : '灰色', element: 'metal' };

  if (h < 15 || h >= 345) return { name: '红色', element: 'fire' };
  if (h < 40) return l < 0.4 ? { name: '棕色', element: 'earth' } : { name: '橙色', element: 'fire' };
  if (h < 70) return { name: '黄色', element: 'earth' };
  if (h < 170) return { name: '绿色', element: 'wood' };
  if (h < 255) return l < 0.35 ? { name: '深蓝色', element: 'water' } : { name: '蓝色', element: 'water' };
  if (h < 300) return { name: '紫色', element: 'fire' };
  return { name: '粉色', element: 'fire' };
}

// 反查：谁生 X（X 的补运五行）
const GENERATES_INVERSE = Object.fromEntries(
  Object.entries(GENERATES).map(([from, to]) => [to, from])
) as Record<Element, Element>;

// 主次权重：无真实像素占比，按提取顺序给定
const RANK_WEIGHTS = [60, 25, 15];

export function detectColors(hexes: string[]): DetectedColor[] {
  const seen = new Set<string>();
  const colors: DetectedColor[] = [];

  for (const hex of hexes) {
    const classified = classifyHex(hex);
    if (!classified || seen.has(classified.name)) continue;
    seen.add(classified.name);
    colors.push({
      hex,
      ...classified,
      percentage: RANK_WEIGHTS[colors.length] ?? 10,
    });
    if (colors.length >= 3) break;
  }
  return colors;
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

// 主色五行 vs 今日财神五行 → 契合/中性/相克
export function analyzeOutfit(hexes: string[], god: God): OutfitAnalysis {
  const colors = detectColors(hexes);

  if (colors.length === 0) {
    return {
      colors,
      verdict: 'neutral',
      verdictText: VERDICT_TEMPLATES.neutral,
      advice: fill(ADVICE_TEMPLATES.neutral, {
        fixColor: ELEMENT_WEAR_COLORS[GENERATES_INVERSE[god.element]],
        accessory: god.accessories[0],
      }),
    };
  }

  const outfitElement = colors[0].element;
  const rel = relation(outfitElement, god.element);
  const vars = {
    outfit: ELEMENT_CN[outfitElement],
    god: ELEMENT_CN[god.element],
    godName: god.name,
    // 补运颜色：能生财神五行的颜色
    fixColor: ELEMENT_WEAR_COLORS[GENERATES_INVERSE[god.element]],
    accessory: god.accessories[0],
  };

  let verdict: Verdict;
  let verdictText: string;

  if (rel === 'same') {
    verdict = 'good';
    verdictText = fill(VERDICT_TEMPLATES.good.same, vars);
  } else if (rel === 'generates') {
    verdict = 'good';
    verdictText = fill(VERDICT_TEMPLATES.good.generates, vars);
  } else if (rel === 'overcomes' || rel === 'overcome_by') {
    verdict = 'clash';
    verdictText = fill(VERDICT_TEMPLATES.clash, vars);
  } else {
    verdict = 'neutral';
    verdictText = VERDICT_TEMPLATES.neutral;
  }

  return {
    colors,
    verdict,
    verdictText,
    advice: fill(ADVICE_TEMPLATES[verdict], vars),
  };
}
