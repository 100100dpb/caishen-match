import { Element } from '../constants/gods';

// 五行相生：木生火 火生土 土生金 金生水 水生木
export const GENERATES: Record<Element, Element> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
};

// 五行相克：木克土 土克水 水克火 火克金 金克木
export const OVERCOMES: Record<Element, Element> = {
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood',
};

// 日干 → 五行
export const GAN_ELEMENT: Record<string, Element> = {
  甲: 'wood', 乙: 'wood',
  丙: 'fire', 丁: 'fire',
  戊: 'earth', 己: 'earth',
  庚: 'metal', 辛: 'metal',
  壬: 'water', 癸: 'water',
};

export const ELEMENT_CN: Record<Element, string> = {
  fire: '火', water: '水', wood: '木', earth: '土', metal: '金',
};

export type ElementRelation = 'same' | 'generates' | 'generated_by' | 'overcomes' | 'overcome_by';

export function relation(from: Element, to: Element): ElementRelation {
  if (from === to) return 'same';
  if (GENERATES[from] === to) return 'generates';
  if (GENERATES[to] === from) return 'generated_by';
  if (OVERCOMES[from] === to) return 'overcomes';
  return 'overcome_by';
}
