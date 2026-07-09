import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { getLunarInfo, LunarInfo } from '../../lib/lunarHelper';
import { recommendToday } from '../../lib/recommender';
import { useUserStore } from '../../store/userStore';
import { GODS } from '../../constants/gods';

const { width } = Dimensions.get('window');
const DAY_SIZE = Math.floor((width - 32 - 12) / 7);

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarScreen() {
  const router = useRouter();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const { profile } = useUserStore();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

  // 整月农历信息（含节日/宜忌），月份切换时重算
  const monthLunar = useMemo<LunarInfo[]>(
    () =>
      Array.from({ length: daysInMonth }, (_, i) =>
        getLunarInfo(new Date(viewYear, viewMonth, i + 1, 12))
      ),
    [viewYear, viewMonth, daysInMonth]
  );

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  }

  const selectedDate = selectedDay
    ? new Date(viewYear, viewMonth, selectedDay, 12)
    : null;
  const selectedLunar = selectedDay ? monthLunar[selectedDay - 1] : null;

  // 选中日的推荐财神（未测试则不展示）
  const dayGod = useMemo(() => {
    if (!selectedDate || !profile.quizCompleted) return null;
    const recs = recommendToday(profile.godRanking, selectedDate);
    return { god: GODS[recs[0].godId], reasons: recs[0].reasons };
  }, [selectedDate?.getTime(), profile.godRanking, profile.quizCompleted]);

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>财神日历</Text>
        <Text style={styles.headerSub}>每日财神宜忌</Text>
      </View>

      {/* Month navigator */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {viewYear}年 {viewMonth + 1}月
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map(d => (
          <Text key={d} style={[styles.weekDay, (d === '日' || d === '六') && styles.weekDayWeekend]}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={`empty-${i}`} style={styles.dayCell} />;

          const lunar = monthLunar[day - 1];
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();
          const isSelected = day === selectedDay;

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayCell,
                lunar.isCaishenDay && styles.dayCellCaishen,
                isSelected && styles.dayCellSelected,
                isToday && !isSelected && styles.dayCellToday,
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                {day}
              </Text>
              {lunar.isCaishenDay ? (
                <Text style={styles.dayMark}>财</Text>
              ) : lunar.festival ? (
                <View style={[styles.dot, { backgroundColor: '#E05C1A' }]} />
              ) : lunar.isAuspicious ? (
                <View style={[styles.dot, { backgroundColor: '#C9A84C' }]} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={styles.legendMark}>财</Text>
          <Text style={styles.legendText}>财神日（迎财神 / 财神节）</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E05C1A' }]} />
          <Text style={styles.legendText}>传统节日</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#C9A84C' }]} />
          <Text style={styles.legendText}>宜祭祀 — 拜财神吉日</Text>
        </View>
      </View>

      {/* Day detail */}
      {selectedDay && selectedLunar && (
        <View style={styles.dayDetail}>
          <Text style={styles.dayDetailTitle}>
            {viewMonth + 1}月{selectedDay}日 · 农历{selectedLunar.monthGanZhi}月{selectedLunar.dayGanZhi}
          </Text>
          {selectedLunar.festival && (
            <Text style={styles.dayFestival}>
              {selectedLunar.isCaishenDay ? '【财神日】' : ''}{selectedLunar.festival}
            </Text>
          )}
          {selectedLunar.term && <Text style={styles.dayTerm}>节气：{selectedLunar.term}</Text>}

          <View style={styles.dayAdviceRow}>
            <View style={[styles.dayAdviceBox, { backgroundColor: '#F0FFF4' }]}>
              <Text style={styles.dayAdviceLabel}>今日宜</Text>
              <Text style={styles.dayAdviceText}>
                {selectedLunar.yi.slice(0, 4).join('、') || '—'}
              </Text>
            </View>
            <View style={[styles.dayAdviceBox, { backgroundColor: '#FFF5F5' }]}>
              <Text style={styles.dayAdviceLabel}>今日忌</Text>
              <Text style={styles.dayAdviceText}>
                {selectedLunar.ji.slice(0, 4).join('、') || '—'}
              </Text>
            </View>
          </View>

          {selectedLunar.isAuspicious && (
            <Text style={styles.worshipHint}>今日宜祭祀，适合拜财神、祈财纳福</Text>
          )}

          {dayGod ? (
            <TouchableOpacity
              style={[styles.dayGodCard, { borderLeftColor: dayGod.god.color, backgroundColor: dayGod.god.bgColor }]}
              onPress={() => router.push(`/wallpaper/${dayGod.god.id}`)}
            >
              <Text style={styles.dayGodLabel}>当日推荐财神</Text>
              <Text style={[styles.dayGodName, { color: dayGod.god.color }]}>{dayGod.god.name}</Text>
              <Text style={styles.dayGodTitle}>{dayGod.god.title}</Text>
              {dayGod.reasons.length > 0 && (
                <View style={styles.reasonRow}>
                  {dayGod.reasons.map(r => (
                    <View key={r} style={styles.reasonChip}>
                      <Text style={styles.reasonText}>{r}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ) : (
            !profile.quizCompleted && (
              <TouchableOpacity style={styles.quizHint} onPress={() => router.push('/quiz')}>
                <Text style={styles.quizHintText}>完成财神测试，查看每日专属推荐 →</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFEF8' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#2C1810' },
  headerSub: { fontSize: 14, color: '#8B6914', marginTop: 4 },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 28, color: '#C9A84C', lineHeight: 32 },
  monthLabel: { fontSize: 18, fontWeight: '700', color: '#2C1810' },

  weekRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 4 },
  weekDay: {
    width: DAY_SIZE,
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  weekDayWeekend: { color: '#C9A84C' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 2 },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DAY_SIZE / 2,
    position: 'relative',
  },
  dayCellCaishen: { backgroundColor: '#FFF3CD' },
  dayCellSelected: { backgroundColor: '#C9A84C' },
  dayCellToday: { borderWidth: 1.5, borderColor: '#C9A84C' },
  dayNum: { fontSize: 15, color: '#2C1810', fontWeight: '500' },
  dayNumSelected: { color: '#fff', fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 4 },
  dayMark: {
    position: 'absolute',
    bottom: 2,
    fontSize: 8,
    color: '#B22222',
    fontWeight: '800',
  },

  legend: { paddingHorizontal: 16, marginTop: 12, gap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendMark: { fontSize: 10, color: '#B22222', fontWeight: '800', width: 8, textAlign: 'center' },
  legendText: { fontSize: 12, color: '#888' },

  dayDetail: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  dayDetailTitle: { fontSize: 16, fontWeight: '700', color: '#2C1810', marginBottom: 4 },
  dayFestival: { fontSize: 13, color: '#B22222', fontWeight: '600', marginBottom: 2 },
  dayTerm: { fontSize: 13, color: '#8B6914', marginBottom: 8 },
  dayAdviceRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 10 },
  dayAdviceBox: { flex: 1, borderRadius: 12, padding: 12 },
  dayAdviceLabel: { fontSize: 12, color: '#888', marginBottom: 4, fontWeight: '600' },
  dayAdviceText: { fontSize: 13, color: '#333', lineHeight: 18 },
  worshipHint: { fontSize: 12, color: '#8B6914', marginBottom: 10 },

  dayGodCard: { borderRadius: 12, padding: 12, borderLeftWidth: 3 },
  dayGodLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  dayGodName: { fontSize: 20, fontWeight: '700' },
  dayGodTitle: { fontSize: 12, color: '#666', marginTop: 2 },
  reasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  reasonChip: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  reasonText: { fontSize: 11, color: '#8B6914', fontWeight: '600' },

  quizHint: {
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0E0A0',
  },
  quizHintText: { fontSize: 13, color: '#8B6914', fontWeight: '600', textAlign: 'center' },
});
