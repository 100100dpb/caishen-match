import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useState } from 'react';
import { getLunarInfo } from '../../lib/lunarHelper';
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

// Simple lucky day check based on common worship days
function isDailyWorship(day: number): boolean {
  return [1, 2, 15, 16].includes(day);
}

function isBusinessLucky(day: number): boolean {
  return [8, 18, 28].includes(day);
}

export default function CalendarScreen() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const { profile } = useUserStore();
  const topGod = profile.godRanking[0];
  const god = topGod ? GODS[topGod.godId] : null;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const selectedDate = selectedDay ? new Date(viewYear, viewMonth, selectedDay) : today;
  const lunar = getLunarInfo(selectedDate);

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

          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const isSelected = day === selectedDay;
          const worship = isDailyWorship(day);
          const lucky = isBusinessLucky(day);

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isToday && !isSelected && styles.dayCellToday,
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                {day}
              </Text>
              {worship && <View style={[styles.dot, { backgroundColor: '#C9A84C' }]} />}
              {lucky && !worship && <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#C9A84C' }]} />
          <Text style={styles.legendText}>拜财神吉日（初一、初二、十五、十六）</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>旺财数（8、18、28日）</Text>
        </View>
      </View>

      {/* Day detail */}
      {selectedDay && (
        <View style={styles.dayDetail}>
          <Text style={styles.dayDetailTitle}>
            {viewMonth + 1}月{selectedDay}日 · 农历{lunar.monthGanZhi}月{lunar.dayGanZhi}
          </Text>
          {lunar.festival && (
            <Text style={styles.dayFestival}>{lunar.festival}</Text>
          )}
          {lunar.term && (
            <Text style={styles.dayTerm}>节气：{lunar.term}</Text>
          )}

          <View style={styles.dayAdviceRow}>
            <View style={[styles.dayAdviceBox, { backgroundColor: '#F0FFF4' }]}>
              <Text style={styles.dayAdviceLabel}>今日宜</Text>
              <Text style={styles.dayAdviceText}>
                {isDailyWorship(selectedDay) ? '拜财神、祈福' : ''}
                {isBusinessLucky(selectedDay) ? '开业、签约' : ''}
                {!isDailyWorship(selectedDay) && !isBusinessLucky(selectedDay) ? '日常守财' : ''}
              </Text>
            </View>
            <View style={[styles.dayAdviceBox, { backgroundColor: '#FFF5F5' }]}>
              <Text style={styles.dayAdviceLabel}>今日忌</Text>
              <Text style={styles.dayAdviceText}>
                {lunar.isAuspicious ? '冲动消费' : '大额投资、借贷'}
              </Text>
            </View>
          </View>

          {god && (
            <View style={[styles.dayGodCard, { borderLeftColor: god.color, backgroundColor: god.bgColor }]}>
              <Text style={styles.dayGodLabel}>今日推荐财神</Text>
              <Text style={[styles.dayGodName, { color: god.color }]}>{god.name}</Text>
              <Text style={styles.dayGodTitle}>{god.title}</Text>
            </View>
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
  dayCellSelected: { backgroundColor: '#C9A84C' },
  dayCellToday: { borderWidth: 1.5, borderColor: '#C9A84C' },
  dayNum: { fontSize: 15, color: '#2C1810', fontWeight: '500' },
  dayNumSelected: { color: '#fff', fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 4 },

  legend: { paddingHorizontal: 16, marginTop: 12, gap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
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
  dayFestival: { fontSize: 13, color: '#C9A84C', fontWeight: '600', marginBottom: 2 },
  dayTerm: { fontSize: 13, color: '#8B6914', marginBottom: 12 },
  dayAdviceRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  dayAdviceBox: { flex: 1, borderRadius: 12, padding: 12 },
  dayAdviceLabel: { fontSize: 12, color: '#888', marginBottom: 4, fontWeight: '600' },
  dayAdviceText: { fontSize: 13, color: '#333', lineHeight: 18 },
  dayGodCard: { borderRadius: 12, padding: 12, borderLeftWidth: 3 },
  dayGodLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  dayGodName: { fontSize: 20, fontWeight: '700' },
  dayGodTitle: { fontSize: 12, color: '#666', marginTop: 2 },
});
