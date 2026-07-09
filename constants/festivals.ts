import { GodId } from './gods';

export interface Festival {
  name: string;
  bonus: number; // recommendation weight: 财神诞=3, 春节=2, 其他=1
  isCaishenDay?: boolean;
  // 节日重点加成的财神；未指定则对所有财神一视同仁（只作氛围加成）
  boostGods?: GodId[];
}

// Key = 农历「月名+日名」，与 lunar-javascript 的 getMonthInChinese/getDayInChinese 拼接一致
export const LUNAR_FESTIVALS: Record<string, Festival> = {
  '正月初一': { name: '春节', bonus: 2 },
  // 迎五路财神：赵公明为五路总帅，关公居西路，另取文/商/偏财代表东南北
  '正月初五': {
    name: '迎财神',
    bonus: 3,
    isCaishenDay: true,
    boostGods: ['zhao', 'guan', 'bigan', 'fanli', 'liuhai'],
  },
  '正月十五': { name: '元宵节', bonus: 1 },
  '二月初二': { name: '龙抬头', bonus: 1 },
  '七月初七': { name: '七夕', bonus: 1 },
  '七月十五': { name: '中元节', bonus: 1 },
  // 财神节（增福财神诞）：主祀文武正财
  '七月廿二': { name: '财神节', bonus: 3, isCaishenDay: true, boostGods: ['zhao', 'bigan'] },
  '九月初九': { name: '重阳节', bonus: 1 },
  '腊月初八': { name: '腊八节', bonus: 1 },
  '腊月廿三': { name: '小年', bonus: 1 },
  '腊月廿四': { name: '小年', bonus: 1 },
};

export function getFestivalByKey(lunarKey: string): Festival | null {
  return LUNAR_FESTIVALS[lunarKey] || null;
}

export function getFestivalBonus(festivalName: string | null): number {
  if (!festivalName) return 0;
  const found = Object.values(LUNAR_FESTIVALS).find(f => f.name === festivalName);
  return found ? found.bonus : 0;
}
