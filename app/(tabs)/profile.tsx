import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/userStore';
import { GODS } from '../../constants/gods';
import { cancelDailyReminder } from '../../lib/notifications';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, setNotificationsEnabled, reset } = useUserStore();
  const topGod = profile.godRanking[0];
  const god = topGod ? GODS[topGod.godId] : null;

  async function toggleNotifications(value: boolean) {
    setNotificationsEnabled(value);
    // 开启时由根布局的 effect 统一调度（带财神名），这里只处理关闭
    if (!value) {
      await cancelDailyReminder();
    }
  }

  function confirmReset() {
    Alert.alert(
      '重置数据',
      '确定要清除所有测试结果和设置吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定重置',
          style: 'destructive',
          onPress: () => {
            reset();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的设置</Text>
      </View>

      {/* God Summary */}
      {god ? (
        <View style={[styles.godSummary, { borderColor: god.color, backgroundColor: god.bgColor }]}>
          <Text style={styles.godSummaryLabel}>我的财神</Text>
          <Text style={[styles.godSummaryName, { color: god.color }]}>{god.name}</Text>
          <Text style={styles.godSummaryTitle}>{god.title}</Text>
          <View style={styles.godSummaryMeta}>
            <Text style={styles.godSummaryMetaText}>五行：{ELEMENT_NAMES[profile.favoredElement] || profile.favoredElement}</Text>
            <Text style={styles.godSummaryMetaText}>主求：{profile.primaryDesire}</Text>
          </View>
          <View style={styles.godSummaryActions}>
            <TouchableOpacity
              style={[styles.retakeBtn, { borderColor: god.color }]}
              onPress={() => router.push('/quiz/result')}
            >
              <Text style={[styles.retakeBtnText, { color: god.color }]}>我的财神</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.retakeBtn, { borderColor: god.color }]}
              onPress={() => router.push('/quiz')}
            >
              <Text style={[styles.retakeBtnText, { color: god.color }]}>重新测试</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.startCard} onPress={() => router.push('/quiz')}>
          <Text style={styles.startCardText}>还没有测试？去找你的财神 →</Text>
        </TouchableOpacity>
      )}

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知设置</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>每日财神提醒</Text>
            <Text style={styles.settingDesc}>每天早上8点推送今日财神</Text>
          </View>
          <Switch
            value={profile.notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#D0C8B8', true: '#C9A84C' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>功能</Text>
        <TouchableOpacity style={styles.featureRow} onPress={() => router.push('/outfit')}>
          <View style={styles.featureInfo}>
            <Text style={styles.featureLabel}>穿搭分析</Text>
            <Text style={styles.featureDesc}>上传今日穿搭，分析与财神五行契合度</Text>
          </View>
          <Text style={styles.featureArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>财神配对</Text>
          <Text style={styles.aboutDesc}>
            娱乐性极强的中国财神文化互动App，通过7道问题找出与你命格最契合的财神。
            所有数据均在本地处理，不收集个人隐私。
          </Text>
          <Text style={styles.aboutVersion}>版本 1.0.0</Text>
        </View>
      </View>

      {/* Reset */}
      <TouchableOpacity style={styles.resetBtn} onPress={confirmReset}>
        <Text style={styles.resetBtnText}>清除所有数据</Text>
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
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#2C1810' },

  godSummary: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
  },
  godSummaryLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  godSummaryName: { fontSize: 32, fontWeight: '800' },
  godSummaryTitle: { fontSize: 14, color: '#666', marginTop: 2 },
  godSummaryMeta: { flexDirection: 'row', gap: 16, marginTop: 8, marginBottom: 16 },
  godSummaryMetaText: { fontSize: 13, color: '#555' },
  godSummaryActions: { flexDirection: 'row', gap: 10 },
  retakeBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  retakeBtnText: { fontSize: 13, fontWeight: '600' },

  startCard: {
    margin: 16,
    backgroundColor: '#FFF8E7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#C9A84C',
    alignItems: 'center',
  },
  startCardText: { fontSize: 15, color: '#8B6914', fontWeight: '600' },

  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },

  settingRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#2C1810' },
  settingDesc: { fontSize: 12, color: '#888', marginTop: 2 },

  featureRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  featureInfo: { flex: 1 },
  featureLabel: { fontSize: 15, fontWeight: '600', color: '#2C1810' },
  featureDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  featureArrow: { fontSize: 22, color: '#C9A84C' },

  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  aboutTitle: { fontSize: 16, fontWeight: '700', color: '#C9A84C', marginBottom: 8 },
  aboutDesc: { fontSize: 13, color: '#666', lineHeight: 20 },
  aboutVersion: { fontSize: 12, color: '#aaa', marginTop: 8 },

  resetBtn: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB4B4',
    backgroundColor: '#FFF5F5',
  },
  resetBtnText: { fontSize: 14, color: '#E53935', fontWeight: '600' },
});
