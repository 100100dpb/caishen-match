import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useUserStore } from '../../store/userStore';
import { getLunarInfo } from '../../lib/lunarHelper';
import { composeParams } from '../../lib/wallpaperComposer';
import { WallpaperCanvas } from '../../components/WallpaperCanvas';
import { GODS } from '../../constants/gods';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useUserStore();

  const topGod = profile.godRanking[0];
  const god = topGod ? GODS[topGod.godId] : null;

  const lunar = useMemo(() => getLunarInfo(), []);
  const wallpaperParams = useMemo(
    () => (god ? composeParams(god.id, new Date()) : null),
    [god?.id]
  );

  if (!profile.quizCompleted) {
    return (
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>财神配对</Text>
        <Text style={styles.welcomeSubtitle}>找到属于你的专属财神</Text>
        <Text style={styles.welcomeDesc}>
          通过7道题，从数十位财神中找出与你命格最契合的守护财神
        </Text>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push('/quiz')}
        >
          <Text style={styles.startBtnText}>开始测试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>今日财神</Text>
          {lunar && (
            <Text style={styles.headerDate}>
              农历{lunar.monthGanZhi}月 · {lunar.dayGanZhi}日
              {lunar.festival ? ` · ${lunar.festival}` : ''}
              {lunar.term ? ` · ${lunar.term}` : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => router.push('/outfit/index')}>
          <View style={styles.outfitBtn}>
            <Text style={styles.outfitBtnText}>穿搭</Text>
            <Text style={styles.outfitBtnText}>分析</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Today's Wallpaper Card */}
      {god && wallpaperParams && (
        <TouchableOpacity
          style={styles.wallpaperCard}
          onPress={() => router.push(`/wallpaper/${god.id}`)}
          activeOpacity={0.9}
        >
          <View style={styles.wallpaperClip}>
            <WallpaperCanvas params={wallpaperParams} width={width - 32} />
            <View style={styles.wallpaperOverlay}>
              <Text style={styles.wallpaperLabel}>今日专属壁纸</Text>
              <Text style={styles.wallpaperTap}>点击保存 / 分享</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* God Info */}
      {god && (
        <View style={[styles.godCard, { borderLeftColor: god.color }]}>
          <Text style={[styles.godCardName, { color: god.color }]}>{god.name}</Text>
          <Text style={styles.godCardTitle}>{god.title}</Text>
          <Text style={styles.godCardDesc}>{god.description}</Text>
          <View style={styles.tagRow}>
            {god.tags.map(tag => (
              <View key={tag} style={[styles.tag, { borderColor: god.color }]}>
                <Text style={[styles.tagText, { color: god.color }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Top 5 quick strip */}
      {profile.godRanking.length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>你的财神池</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {profile.godRanking.map((gs, i) => {
              const g = GODS[gs.godId];
              return (
                <TouchableOpacity
                  key={gs.godId}
                  style={[styles.miniCard, { backgroundColor: g.bgColor }]}
                  onPress={() => router.push(`/wallpaper/${gs.godId}`)}
                >
                  <Text style={styles.miniRank}>#{i + 1}</Text>
                  <Text style={[styles.miniName, { color: g.color }]}>{g.name}</Text>
                  <Text style={styles.miniPct}>{gs.matchPercent}%</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Lunar info */}
      {lunar && (
        <View style={styles.lunarCard}>
          <Text style={styles.lunarTitle}>今日宜</Text>
          <Text style={styles.lunarText}>
            {lunar.isAuspicious ? '今日宜祭祀，适合拜财神、祈财纳福' : '今日宜静守，勿大动财数'}
          </Text>
          <Text style={styles.lunarGanZhi}>
            {lunar.yearGanZhi}年 {lunar.monthGanZhi}月 {lunar.dayGanZhi}日
          </Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFEF8' },

  welcomeContainer: {
    flex: 1,
    backgroundColor: '#FFFEF8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  welcomeTitle: { fontSize: 36, fontWeight: '700', color: '#C9A84C', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 18, color: '#8B6914', marginBottom: 16 },
  welcomeDesc: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  startBtn: {
    backgroundColor: '#C9A84C',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
  },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#2C1810' },
  headerDate: { fontSize: 12, color: '#8B6914', marginTop: 4 },
  outfitBtn: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#C9A84C',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  outfitBtnText: { fontSize: 12, color: '#8B6914', fontWeight: '600' },

  wallpaperCard: { margin: 16, borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#C9A84C', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  wallpaperClip: { height: width * 1.2, overflow: 'hidden', position: 'relative' },
  wallpaperOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wallpaperLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  wallpaperTap: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

  godCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  godCardName: { fontSize: 22, fontWeight: '700' },
  godCardTitle: { fontSize: 14, color: '#666', marginTop: 2, marginBottom: 8 },
  godCardDesc: { fontSize: 14, color: '#444', lineHeight: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '500' },

  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2C1810', marginBottom: 12 },

  miniCard: {
    width: 80,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
    gap: 4,
  },
  miniRank: { fontSize: 10, color: '#999' },
  miniName: { fontSize: 14, fontWeight: '700' },
  miniPct: { fontSize: 11, color: '#666' },

  lunarCard: {
    margin: 16,
    backgroundColor: '#FFF8E7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E0A0',
  },
  lunarTitle: { fontSize: 14, fontWeight: '700', color: '#8B6914', marginBottom: 6 },
  lunarText: { fontSize: 14, color: '#555', lineHeight: 20 },
  lunarGanZhi: { fontSize: 12, color: '#999', marginTop: 8 },
});
