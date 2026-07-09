import { Element } from './gods';

// 五行 → 穿戴颜色词（补运建议用）
export const ELEMENT_WEAR_COLORS: Record<Element, string> = {
  fire: '红色或橙色',
  water: '黑色或深蓝色',
  wood: '绿色或青色',
  earth: '黄色或棕色',
  metal: '白色或银色',
};

// 结论文案模板：{outfit}=穿搭五行, {god}=财神五行, {godName}=财神名, {fixColor}=补运颜色
export const VERDICT_TEMPLATES = {
  good: {
    same: '今日穿搭与{godName}同气相求，{outfit}气当令，财运加持！',
    generates: '今日穿搭{outfit}生{god}，与{godName}共振，财气随身！',
  },
  neutral: '今日穿搭五行中性，对财运无明显加分或减分。',
  clash: '主色{outfit}与{godName}（{god}系）相克，恐有财气外漏。',
} as const;

export const ADVICE_TEMPLATES = {
  good: '继续保持这种配色，今日外出、谈判、签约均有利。可佩戴{accessory}锦上添花。',
  neutral: '可添加{fixColor}系小配件（手链、围巾、口袋巾）为今日财运加持，或佩戴{accessory}。',
  clash: '建议搭配{fixColor}系配饰化解相克，佩戴{accessory}可稳固财气。',
} as const;
