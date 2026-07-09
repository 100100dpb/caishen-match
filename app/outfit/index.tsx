import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { getColors } from 'react-native-image-colors';
import { useUserStore } from '../../store/userStore';
import { GODS } from '../../constants/gods';
import { recommendToday } from '../../lib/recommender';
import { analyzeOutfit, OutfitAnalysis } from '../../lib/outfitAnalyzer';
import { ELEMENT_CN } from '../../lib/wuxing';

const VERDICT_CONFIG = {
  good: { emoji: '✅', label: '契合', bg: '#F0FFF4', border: '#4CAF50', text: '#2E7D32' },
  neutral: { emoji: '⚠️', label: '中性', bg: '#FFFDE7', border: '#FFC107', text: '#8B6914' },
  clash: { emoji: '❌', label: '相克', bg: '#FFF5F5', border: '#F44336', text: '#C62828' },
};

// 从 image-colors 的平台差异结果中收集主色 hex（按主次序）
function extractHexes(result: Awaited<ReturnType<typeof getColors>>): string[] {
  switch (result.platform) {
    case 'ios':
      return [result.primary, result.background, result.secondary, result.detail];
    case 'android':
      return [
        result.dominant,
        result.vibrant,
        result.muted,
        result.darkVibrant,
        result.lightVibrant,
      ].filter((c): c is string => !!c);
    default: // web
      return [result.dominant, result.vibrant, result.muted].filter((c): c is string => !!c);
  }
}

export default function OutfitScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OutfitAnalysis | null>(null);

  // 今日财神（与首页推荐一致）
  const todayGod = useMemo(() => {
    if (!profile.quizCompleted) return null;
    const recs = recommendToday(profile.godRanking, new Date());
    return GODS[recs[0].godId];
  }, [profile.godRanking, profile.quizCompleted]);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要相册权限', '请在设置中允许访问相册');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      setImageUri(pickerResult.assets[0].uri);
      setResult(null);
    }
  }

  async function runAnalysis() {
    if (!imageUri || !todayGod) return;

    setLoading(true);
    try {
      const colors = await getColors(imageUri, { fallback: '#888888', cache: false });
      const hexes = extractHexes(colors);
      setResult(analyzeOutfit(hexes, todayGod));
    } catch {
      Alert.alert('分析失败', '无法读取图片颜色，请换一张照片试试');
    } finally {
      setLoading(false);
    }
  }

  const vc = result ? VERDICT_CONFIG[result.verdict] : null;

  if (!todayGod) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>先完成财神测试，才能分析穿搭契合度</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => router.replace('/quiz')}>
          <Text style={styles.emptyBtnText}>去测试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>穿搭财运分析</Text>
        <Text style={styles.headerSub}>
          今日财神 {todayGod.name}（{ELEMENT_CN[todayGod.element]}系）
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Image picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>👔</Text>
              <Text style={styles.imagePlaceholderText}>点击选择今日穿搭照片</Text>
              <Text style={styles.imagePlaceholderSub}>支持全身照、半身照</Text>
            </View>
          )}
        </TouchableOpacity>

        {imageUri && !result && (
          <TouchableOpacity style={styles.analyzeBtn} onPress={runAnalysis} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.analyzeBtnText}>开始分析五行契合度</Text>
            )}
          </TouchableOpacity>
        )}

        {loading && <Text style={styles.loadingHint}>财神正在感应你的穿搭能量...</Text>}

        {/* Results */}
        {result && vc && (
          <View style={styles.resultBlock}>
            {/* Verdict */}
            <View style={[styles.verdictCard, { backgroundColor: vc.bg, borderColor: vc.border }]}>
              <Text style={styles.verdictEmoji}>{vc.emoji}</Text>
              <View style={styles.verdictInfo}>
                <Text style={[styles.verdictLabel, { color: vc.text }]}>{vc.label}</Text>
                <Text style={[styles.verdictText, { color: vc.text }]}>{result.verdictText}</Text>
              </View>
            </View>

            {/* Color breakdown */}
            {result.colors.length > 0 && (
              <View style={styles.colorsCard}>
                <Text style={styles.colorsTitle}>识别到的主色调</Text>
                {result.colors.map((c, i) => (
                  <View key={i} style={styles.colorRow}>
                    <View style={[styles.colorSwatch, { backgroundColor: c.hex }]} />
                    <Text style={styles.colorName}>{c.name}</Text>
                    <Text style={styles.colorElement}>{ELEMENT_CN[c.element]}系</Text>
                    <View style={styles.colorBarBg}>
                      <View style={[styles.colorBarFill, { width: `${c.percentage}%` }]} />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Advice */}
            <View style={styles.adviceCard}>
              <Text style={styles.adviceTitle}>建议</Text>
              <Text style={styles.adviceText}>{result.advice}</Text>
            </View>

            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setImageUri(null);
                setResult(null);
              }}
            >
              <Text style={styles.retryBtnText}>换一张照片</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFEF8' },

  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFEF8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  emptyText: { fontSize: 15, color: '#666', textAlign: 'center' },
  emptyBtn: { backgroundColor: '#C9A84C', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  header: { paddingTop: 24, paddingHorizontal: 24, paddingBottom: 8 },
  closeBtn: { alignSelf: 'flex-end', padding: 8 },
  closeBtnText: { fontSize: 18, color: '#888' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#2C1810' },
  headerSub: { fontSize: 13, color: '#8B6914', marginTop: 4 },

  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 12 },

  imagePicker: {
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFF8E7',
    borderWidth: 1.5,
    borderColor: '#E8DFC8',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderIcon: { fontSize: 40 },
  imagePlaceholderText: { fontSize: 15, color: '#8B6914', fontWeight: '600' },
  imagePlaceholderSub: { fontSize: 12, color: '#B8A88A' },

  analyzeBtn: {
    backgroundColor: '#C9A84C',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  analyzeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  loadingHint: { textAlign: 'center', color: '#B8A88A', fontSize: 13, marginBottom: 16 },

  resultBlock: { gap: 12 },
  verdictCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  verdictEmoji: { fontSize: 26 },
  verdictInfo: { flex: 1 },
  verdictLabel: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  verdictText: { fontSize: 14, lineHeight: 21 },

  colorsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  colorsTitle: { fontSize: 14, fontWeight: '700', color: '#2C1810', marginBottom: 12 },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  colorSwatch: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  colorName: { fontSize: 14, color: '#333', width: 60 },
  colorElement: { fontSize: 12, color: '#8B6914', width: 36 },
  colorBarBg: { flex: 1, height: 6, backgroundColor: '#F0E8D0', borderRadius: 3, overflow: 'hidden' },
  colorBarFill: { height: '100%', backgroundColor: '#C9A84C', borderRadius: 3 },

  adviceCard: {
    backgroundColor: '#FFF8E7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E0A0',
  },
  adviceTitle: { fontSize: 14, fontWeight: '700', color: '#8B6914', marginBottom: 6 },
  adviceText: { fontSize: 14, color: '#555', lineHeight: 22 },

  retryBtn: {
    borderWidth: 1,
    borderColor: '#C9A84C',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryBtnText: { color: '#C9A84C', fontSize: 14, fontWeight: '600' },
});
