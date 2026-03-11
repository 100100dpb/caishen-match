import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { GODS } from '../../constants/gods';

const { width } = Dimensions.get('window');

export default function ResultScreen() {
  const router = useRouter();
  const { profile } = useUserStore();

  if (!profile.quizCompleted || profile.godRanking.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>还没有测试结果</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(tabs)/quiz')}>
          <Text style={styles.btnText}>去测试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const top = profile.godRanking[0];
  const topGod = GODS[top.godId];

  async function shareResult() {
    try {
      await Share.share({
        message: `我的专属财神是【${topGod.name}】— ${topGod.title}\n匹配度 ${top.matchPercent}%\n\n${topGod.description}\n\n来财神配对App测测你的财神 →`,
      });
    } catch {}
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>你的专属财神</Text>
      </View>

      {/* Main god */}
      <View style={[styles.heroCard, { backgroundColor: topGod.bgColor, borderColor: topGod.color }]}>
        <View style={styles.heroRankBadge}>
          <Text style={styles.heroRankText}>#1 最强匹配</Text>
        </View>
        <Text style={[styles.heroName, { color: topGod.color }]}>{topGod.name}</Text>
        <Text style={styles.heroTitle}>{topGod.title}</Text>

        {/* Match bar */}
        <View style={styles.matchBarContainer}>
          <View style={styles.matchBarBg}>
            <View style={[styles.matchBarFill, { width: `${top.matchPercent}%`, backgroundColor: topGod.color }]} />
          </View>
          <Text style={[styles.matchPct, { color: topGod.color }]}>{top.matchPercent}%</Text>
        </View>

        <Text style={styles.heroDesc}>{topGod.description}</Text>

        <View style={styles.tagRow}>
          {topGod.tags.map(tag => (
            <View key={tag} style={[styles.tag, { borderColor: topGod.color }]}>
              <Text style={[styles.tagText, { color: topGod.color }]}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.heroActions}>
          <TouchableOpacity
            style={[styles.heroBtn, { backgroundColor: topGod.color }]}
            onPress={() => router.push(`/wallpaper/${topGod.id}`)}
          >
            <Text style={styles.heroBtnText}>获取专属壁纸</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.heroBtn, styles.heroBtnOutline, { borderColor: topGod.color }]} onPress={shareResult}>
            <Text style={[styles.heroBtnText, { color: topGod.color }]}>分享结果</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Analysis */}
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>测试分析</Text>
        <View style={styles.analysisRow}>
          <Text style={styles.analysisLabel}>主要诉求</Text>
          <Text style={styles.analysisValue}>{profile.primaryDesire}</Text>
        </View>
        <View style={styles.analysisRow}>
          <Text style={styles.analysisLabel}>五行偏好</Text>
          <Text style={styles.analysisValue}>{ELEMENT_NAMES[profile.favoredElement] || profile.favoredElement}</Text>
        </View>
      </View>

      {/* Top 5 pool */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>财神匹配池 Top 5</Text>
        {profile.godRanking.map((gs, i) => {
          const g = GODS[gs.godId];
          return (
            <TouchableOpacity
              key={gs.godId}
              style={styles.rankRow}
              onPress={() => router.push(`/wallpaper/${gs.godId}`)}
            >
              <Text style={styles.rankNum}>{i + 1}</Text>
              <View style={[styles.rankDot, { backgroundColor: g.color }]} />
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{g.name}</Text>
                <Text style={styles.rankTitle}>{g.title}</Text>
              </View>
              <View style={styles.rankBarWrap}>
                <View style={styles.rankBarBg}>
                  <View style={[styles.rankBarFill, { width: `${gs.matchPercent}%`, backgroundColor: g.color }]} />
                </View>
                <Text style={styles.rankPct}>{gs.matchPercent}%</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Retake */}
      <TouchableOpacity style={styles.retakeBtn} onPress={() => router.push('/(tabs)/quiz')}>
        <Text style={styles.retakeBtnText}>重新测试</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const ELEMENT_NAMES: Record<string, string> = {
  fire: '火',
  water: '水',
  wood: '木',
  earth: '土',
  metal: '金',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFEF8' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { fontSize: 16, color: '#888' },
  btn: { backgroundColor: '#C9A84C', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#2C1810' },

  heroCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#C9A84C',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  heroRankBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  heroRankText: { fontSize: 12, color: '#8B6914', fontWeight: '600' },
  heroName: { fontSize: 40, fontWeight: '800', letterSpacing: 2 },
  heroTitle: { fontSize: 16, color: '#666', marginTop: 4, marginBottom: 16 },
  matchBarContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  matchBarBg: { flex: 1, height: 8, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' },
  matchBarFill: { height: '100%', borderRadius: 4 },
  matchPct: { fontSize: 16, fontWeight: '700', width: 44 },
  heroDesc: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 16 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '500' },
  heroActions: { flexDirection: 'row', gap: 10 },
  heroBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  heroBtnOutline: { backgroundColor: 'transparent', borderWidth: 1.5 },
  heroBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  analysisCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  analysisTitle: { fontSize: 15, fontWeight: '700', color: '#2C1810', marginBottom: 4 },
  analysisRow: { flexDirection: 'row', justifyContent: 'space-between' },
  analysisLabel: { fontSize: 14, color: '#888' },
  analysisValue: { fontSize: 14, fontWeight: '600', color: '#C9A84C' },

  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2C1810', marginBottom: 12 },

  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  rankNum: { fontSize: 16, fontWeight: '700', color: '#C9A84C', width: 20, textAlign: 'center' },
  rankDot: { width: 10, height: 10, borderRadius: 5 },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 15, fontWeight: '700', color: '#2C1810' },
  rankTitle: { fontSize: 11, color: '#888', marginTop: 1 },
  rankBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rankBarBg: { width: 60, height: 4, backgroundColor: '#F0E8D0', borderRadius: 2, overflow: 'hidden' },
  rankBarFill: { height: '100%', borderRadius: 2 },
  rankPct: { fontSize: 12, color: '#888', width: 32, textAlign: 'right' },

  retakeBtn: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#C9A84C',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  retakeBtnText: { color: '#C9A84C', fontSize: 15, fontWeight: '600' },
});
