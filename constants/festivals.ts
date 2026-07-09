export interface Festival {
  name: string;
  bonus: number; // recommendation weight: 财神诞=3, 春节=2, 其他=1
  isCaishenDay?: boolean;
}

// Key = 农历「月名+日名」，与 lunar-javascript 的 getMonthInChinese/getDayInChinese 拼接一致
export const LUNAR_FESTIVALS: Record<string, Festival> = {
  '正月初一': { name: '春节', bonus: 2 },
  '正月初五': { name: '迎财神', bonus: 3, isCaishenDay: true },
  '正月十五': { name: '元宵节', bonus: 1 },
  '二月初二': { name: '龙抬头', bonus: 1 },
  '七月初七': { name: '七夕', bonus: 1 },
  '七月十五': { name: '中元节', bonus: 1 },
  '七月廿二': { name: '财神节', bonus: 3, isCaishenDay: true },
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
