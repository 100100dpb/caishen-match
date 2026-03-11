// @ts-ignore — lunar-javascript has no type definitions
import { Lunar, Solar } from 'lunar-javascript';

export interface LunarInfo {
  month: number;
  day: number;
  festival: string | null;
  term: string | null; // solar term / 节气
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  isAuspicious: boolean;
}

const MAJOR_FESTIVALS: Record<string, string> = {
  '正月初一': '春节',
  '正月十五': '元宵节',
  '二月初二': '龙抬头',
  '七月初七': '七夕',
  '七月十五': '中元节',
  '九月初九': '重阳节',
  '腊月初八': '腊八节',
  '腊月廿三': '小年',
  '腊月廿四': '小年',
};

export function getLunarInfo(date: Date = new Date()): LunarInfo {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();

  const monthName = lunar.getMonthInChinese();
  const dayName = lunar.getDayInChinese();
  const festivalKey = `${monthName}月${dayName}`;
  const festival = MAJOR_FESTIVALS[festivalKey] || null;

  const term = lunar.getCurrentJieQi()?.getName() || null;

  // Simple auspicious day check — avoid clash days
  const dayZhi = lunar.getDayZhi();
  const clashZhi = ['冲', '破', '害'];
  const isAuspicious = !clashZhi.some(c => lunar.getDayNaYin()?.includes(c));

  return {
    month: lunar.getMonth(),
    day: lunar.getDay(),
    festival,
    term,
    yearGanZhi: `${lunar.getYearGan()}${lunar.getYearZhi()}`,
    monthGanZhi: `${lunar.getMonthGan()}${lunar.getMonthZhi()}`,
    dayGanZhi: `${lunar.getDayGan()}${dayZhi}`,
    isAuspicious,
  };
}

export function getLunarDayBonus(day: number): number {
  // Special lucky days for fortune gods
  if ([1, 2, 15, 16].includes(day)) return 2; // 初一、初二、十五、十六 major worship days
  if ([8, 18, 28].includes(day)) return 1; // 8, 18, 28 — lucky business numbers
  return 0;
}

export function getFestivalBonus(festival: string | null): number {
  if (!festival) return 0;
  if (festival === '春节') return 3;
  if (['元宵节', '腊八节', '小年'].includes(festival)) return 2;
  return 1;
}
