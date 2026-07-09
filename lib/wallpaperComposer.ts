import { GodId, GODS, Element } from '../constants/gods';
import { getLunarInfo } from './lunarHelper';

// 壁纸设计基准尺寸（iPhone 15 Pro Max），预览时等比缩放
export const WALLPAPER_WIDTH = 1290;
export const WALLPAPER_HEIGHT = 2796;
export const WALLPAPER_ASPECT = WALLPAPER_WIDTH / WALLPAPER_HEIGHT;

export interface WallpaperParams {
  godId: GodId;
  godName: string;
  godTitle: string;
  bgGradient: [string, string, string];
  accentColor: string;
  textColor: string;
  blessing: string;
  dateText: string; // 农历表述
  festivalText: string | null;
}

// 五行配色：[顶部, 中部, 底部] 渐变 + 文字色
const ELEMENT_PALETTES: Record<Element, { gradient: [string, string, string]; text: string }> = {
  fire: { gradient: ['#3B0A0A', '#7A1E12', '#C2452B'], text: '#FFE8D6' },
  water: { gradient: ['#050A1E', '#12275A', '#2E5DB3'], text: '#DCE8FF' },
  wood: { gradient: ['#08170C', '#1C4423', '#3E7A48'], text: '#E2F5E4' },
  earth: { gradient: ['#241505', '#5C3D10', '#A8752A'], text: '#FFF3D9' },
  metal: { gradient: ['#101014', '#3A3A44', '#8C8C99'], text: '#F5F5FA' },
};

// 节日配色（覆盖五行）：喜庆红金
const FESTIVAL_PALETTE: { gradient: [string, string, string]; text: string } = {
  gradient: ['#4A0505', '#8C1010', '#C9A84C'],
  text: '#FFE8B0',
};

// 由日期生成确定性的伪随机索引（同日同神结果不变）
function dateSeed(date: Date, godId: string): number {
  const key = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${godId}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const CN_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const CN_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];

function lunarDateText(month: number, day: number): string {
  const m = CN_MONTHS[Math.abs(month) - 1] || '';
  const leap = month < 0 ? '闰' : '';
  const d = CN_DAYS[day - 1] || '';
  return `农历${leap}${m}月${d}`;
}

export function composeParams(godId: GodId, date: Date): WallpaperParams {
  const god = GODS[godId];
  const lunar = getLunarInfo(date);

  const palette = lunar.festival ? FESTIVAL_PALETTE : ELEMENT_PALETTES[god.element];
  const blessing = god.blessing[dateSeed(date, godId) % god.blessing.length];

  return {
    godId,
    godName: god.name,
    godTitle: god.title,
    bgGradient: palette.gradient,
    accentColor: god.color,
    textColor: palette.text,
    blessing,
    dateText: lunarDateText(lunar.month, lunar.day),
    festivalText: lunar.festival,
  };
}
