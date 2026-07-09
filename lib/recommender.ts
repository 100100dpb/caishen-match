import { GodId, GOD_LIST } from '../constants/gods';
import { GodScore } from './godMatcher';
import { getLunarInfo, getLunarDayBonus } from './lunarHelper';
import { Festival, LUNAR_FESTIVALS } from '../constants/festivals';
import { GENERATES, OVERCOMES, GAN_ELEMENT, ELEMENT_CN } from './wuxing';

export interface DailyRecommendation {
  godId: GodId;
  score: number;
  reasons: string[]; // 推荐理由标签，展示用
}

// 权重（总分 100）：基础匹配 40 + 农历日 20 + 节日 20 + 五行 20
const BASE_WEIGHTS = [40, 32, 24, 16, 8]; // 测试排名 Top1-5

const WORSHIP_DAY_NAMES: Record<number, string> = {
  1: '初一', 2: '初二', 15: '十五', 16: '十六',
};

export function recommendToday(
  godRanking: GodScore[],
  date: Date = new Date()
): DailyRecommendation[] {
  const lunar = getLunarInfo(date);
  const dayElement = GAN_ELEMENT[lunar.dayGanZhi[0]] || null;
  const dayBonus = getLunarDayBonus(lunar.day);
  const festival: Festival | null = lunar.festival
    ? Object.values(LUNAR_FESTIVALS).find(f => f.name === lunar.festival) || null
    : null;

  const rankIndex = new Map<GodId, number>();
  godRanking.forEach((gs, i) => rankIndex.set(gs.godId, i));

  const results: DailyRecommendation[] = GOD_LIST.map(god => {
    let score = 0;
    const reasons: string[] = [];

    // 1. 测试匹配基础分（40%）
    const rank = rankIndex.get(god.id);
    if (rank !== undefined && rank < BASE_WEIGHTS.length) {
      score += BASE_WEIGHTS[rank];
      if (rank === 0) reasons.push('缘分最深');
    }

    // 2. 农历日加成（20%）：初一/初二/十五/十六=20，8/18/28=10
    if (dayBonus > 0) {
      score += dayBonus * 10;
      const dayName = WORSHIP_DAY_NAMES[lunar.day];
      reasons.push(dayName ? `${dayName}上香日` : '旺财吉数日');
    }

    // 3. 节日加成（20%）：财神诞=20，春节≈13，其他≈7
    // 指定了 boostGods 的节日只加成对应财神（如迎财神日主推五路财神）
    if (festival && (!festival.boostGods || festival.boostGods.includes(god.id))) {
      score += Math.round((festival.bonus / 3) * 20);
      reasons.push(festival.name);
    }

    // 4. 日干五行相生克（20%）
    if (dayElement) {
      if (GENERATES[dayElement] === god.element) {
        score += 20;
        reasons.push(`${ELEMENT_CN[dayElement]}生${ELEMENT_CN[god.element]}`);
      } else if (dayElement === god.element) {
        score += 10;
        reasons.push(`${ELEMENT_CN[god.element]}气当令`);
      } else if (
        OVERCOMES[dayElement] === god.element ||
        OVERCOMES[god.element] === dayElement
      ) {
        score -= 10;
      }
    }

    return { godId: god.id, score, reasons };
  });

  // 确定性排序：分数降序，同分按 godId 字典序
  return results.sort((a, b) => b.score - a.score || a.godId.localeCompare(b.godId));
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
