// @ts-ignore — lunar-javascript has no type definitions
import { Lunar, Solar } from 'lunar-javascript';
import { getFestivalByKey, getFestivalBonus } from '../constants/festivals';

export interface LunarInfo {
  month: number;
  day: number;
  festival: string | null;
  isCaishenDay: boolean; // 迎财神/财神节
  term: string | null; // solar term / 节气
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  yi: string[]; // 今日宜
  ji: string[]; // 今日忌
  isAuspicious: boolean; // 宜祭祀 = 拜财神吉日
}

export function getLunarInfo(date: Date = new Date()): LunarInfo {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();

  const monthName = lunar.getMonthInChinese();
  const dayName = lunar.getDayInChinese();
  const festivalKey = `${monthName}月${dayName}`;
  const festival = getFestivalByKey(festivalKey);

  const term = lunar.getCurrentJieQi()?.getName() || null;

  const yi: string[] = lunar.getDayYi() || [];
  const ji: string[] = lunar.getDayJi() || [];
  const isAuspicious = yi.some(item => item.includes('祭祀'));

  return {
    month: lunar.getMonth(),
    day: lunar.getDay(),
    festival: festival?.name || null,
    isCaishenDay: festival?.isCaishenDay || false,
    term,
    yearGanZhi: `${lunar.getYearGan()}${lunar.getYearZhi()}`,
    monthGanZhi: `${lunar.getMonthGan()}${lunar.getMonthZhi()}`,
    dayGanZhi: `${lunar.getDayGan()}${lunar.getDayZhi()}`,
    yi,
    ji,
    isAuspicious,
  };
}

export function getLunarDayBonus(day: number): number {
  // Special lucky days for fortune gods
  if ([1, 2, 15, 16].includes(day)) return 2; // 初一、初二、十五、十六 major worship days
  if ([8, 18, 28].includes(day)) return 1; // 8, 18, 28 — lucky business numbers
  return 0;
}

export { getFestivalBonus };
