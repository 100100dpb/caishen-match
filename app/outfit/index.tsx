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
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Anthropic from '@anthropic-ai/sdk';
import { useUserStore } from '../../store/userStore';
import { GODS } from '../../constants/gods';

// NOTE: In production, move API key to a secure backend.
// For this no-backend MVP, the key is read from an env var via a config file.
const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

interface ColorResult {
  name: string;
  element: string;
  percentage: number;
}

interface AnalysisResult {
  colors: ColorResult[];
  verdict: 'good' | 'neutral' | 'clash';
  verdictText: string;
  advice: string;
}

const ELEMENT_TO_CHINESE: Record<string, string> = {
  fire: '火', water: '水', wood: '木', earth: '土', metal: '金',
};

const VERDICT_CONFIG = {
  good: { emoji: '✅', label: '契合', bg: '#F0FFF4', border: '#4CAF50', text: '#2E7D32' },
  neutral: { emoji: '⚠️', label: '中性', bg: '#FFFDE7', border: '#FFC107', text: '#8B6914' },
  clash: { emoji: '❌', label: '相克', bg: '#FFF5F5', border: '#F44336', text: '#C62828' },
};

export default function OutfitScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const topGod = profile.godRanking[0];
  const god = topGod ? GODS[topGod.godId] : null;
  const userElement = profile.favoredElement;

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
      base64: true,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      const asset = pickerResult.assets[0];
      setImageUri(asset.uri);
      setImageBase64(asset.base64 || null);
      setResult(null);
    }
  }

  async function analyzeOutfit() {
    if (!imageBase64) return;
    if (!ANTHROPIC_API_KEY) {
      Alert.alert('配置缺失', '请设置 EXPO_PUBLIC_ANTHROPIC_API_KEY 环境变量');
      return;
    }

    setLoading(true);
    try {
      const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY, dangerouslyAllowBrowser: true });

      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `分析这张穿搭照片的主色调，按占比从高到低列出最多3种颜色，每种颜色映射到五行属性（火/水/木/土/金）。
规则：红/橙→火，黄/棕→土，白/银/灰→金，黑/深蓝/深紫→水，绿→木。
只返回JSON，不要其他文字：{"colors":[{"name":"颜色名","element":"五行","percentage":占比数字}]}`,
              },
            ],
          },
        ],
      });

      const raw = (message.content[0] as any).text?.trim() || '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid response');

      const parsed: { colors: ColorResult[] } = JSON.parse(jsonMatch[0]);
      const analysis = buildAnalysis(parsed.colors, userElement);
      setResult(analysis);
    } catch (e) {
      Alert.alert('分析失败', '请检查网络连接或API配置后重试');
    } finally {
      setLoading(false);
    }
  }

  function buildAnalysis(colors: ColorResult[], userElement: string): AnalysisResult {
    // Map user element to complementary/clashing
    const ELEMENT_COMPLEMENT: Record<string, string[]> = {
      fire: ['wood', 'fire'],
      water: ['metal', 'water'],
      wood: ['water', 'wood'],
      earth: ['fire', 'earth'],
      metal: ['earth', 'metal'],
    };
    const ELEMENT_CLASH: Record<string, string[]> = {
      fire: ['water', 'metal'],
      water: ['earth', 'fire'],
      wood: ['metal', 'earth'],
      earth: ['wood', 'water'],
      metal: ['fire', 'wood'],
    };

    const topElement = colors[0]?.element || '';
    const compatible = ELEMENT_COMPLEMENT[userElement] || [];
    const clashing = ELEMENT_CLASH[userElement] || [];

    let verdict: AnalysisResult['verdict'];
    let verdictText: string;
    let advice: string;

    if (compatible.includes(topElement)) {
      verdict = 'good';
      verdictText = `今日穿搭与财神共振，${ELEMENT_TO_CHINESE[topElement]}与${ELEMENT_TO_CHINESE[userElement]}相生，财运加持！`;
      advice = `继续保持这种配色，今日外出、谈判、签约均有利。`;
    } else if (clashing.includes(topElement)) {
      verdict = 'clash';
      verdictText = `主色${ELEMENT_TO_CHINESE[topElement]}与喜用神${ELEMENT_TO_CHINESE[userElement]}相克，可能有财气外漏。`;
      const fixColors: Record<string, string> = {
        fire: '红色或橙色',
        water: '黑色或深蓝',
        wood: '绿色或青色',
        earth: '黄色或棕色',
        metal: '白色或银色',
      };
      advice = `建议搭配${fixColors[userElement] || ''}系配饰（手链、围巾、口袋巾），以补足五行能量。`;
    } else {
      verdict = 'neutral';
      verdictText = `今日穿搭五行中性，对财运无明显加分或减分。`;
      advice = `可添加${ELEMENT_TO_CHINESE[userElement]}系小配件为今日财运加持。`;
    }

    return { colors, verdict, verdictText, advice };
  }

  const vc = result ? VERDICT_CONFIG[result.verdict] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>穿搭财运分析</Text>
        {god && (
          <Text style={styles.headerSub}>
            基于你的财神 {god.name}（{ELEMENT_TO_CHINESE[userElement]}系）
          </Text>
        )}
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
          <TouchableOpacity
            style={styles.analyzeBtn}
            onPress={analyzeOutfit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.analyzeBtnText}>开始分析五行契合度</Text>
            )}
          </TouchableOpacity>
        )}

        {loading && (
          <Text style={styles.loadingHint}>财神正在感应你的穿搭能量...</Text>
        )}

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
            <View style={styles.colorsCard}>
              <Text style={styles.colorsTitle}>识别到的主色调</Text>
              {result.colors.map((c, i) => (
                <View key={i} style={styles.colorRow}>
                  <Text style={styles.colorName}>{c.name}</Text>
                  <Text style={styles.colorElement}>{ELEMENT_TO_CHINESE[c.element] || c.element}系</Text>
                  <View style={styles.colorBarBg}>
                    <View style={[styles.colorBarFill, { width: `${c.percentage}%` }]} />
                  </View>
                  <Text style={styles.colorPct}>{c.percentage}%</Text>
                </View>
              ))}
            </View>

            {/* Advice */}
            <View style={styles.adviceCard}>
              <Text style={styles.adviceTitle}>建议</Text>
              <Text style={styles.adviceText}>{result.advice}</Text>
            </View>

            {/* Reanalyze */}
            <TouchableOpacity style={styles.retryBtn} onPress={pickImage}>
              <Text style={styles.retryBtnText}>换一张照片</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFEF8' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, position: 'relative' },
  closeBtn: { position: 'absolute', top: 56, right: 20, padding: 8 },
  closeBtnText: { fontSize: 18, color: '#888' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#2C1810' },
  headerSub: { fontSize: 13, color: '#8B6914', marginTop: 4 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },

  imagePicker: {
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFF8E7',
    borderWidth: 2,
    borderColor: '#E8DFC8',
    borderStyle: 'dashed',
  },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderIcon: { fontSize: 48 },
  imagePlaceholderText: { fontSize: 15, color: '#8B6914', fontWeight: '600' },
  imagePlaceholderSub: { fontSize: 12, color: '#aaa' },

  analyzeBtn: {
    backgroundColor: '#C9A84C',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  analyzeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loadingHint: { textAlign: 'center', color: '#8B6914', fontSize: 13 },

  resultBlock: { gap: 12 },
  verdictCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  verdictEmoji: { fontSize: 28 },
  verdictInfo: { flex: 1 },
  verdictLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  verdictText: { fontSize: 14, lineHeight: 20 },

  colorsCard: {
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
  colorsTitle: { fontSize: 14, fontWeight: '700', color: '#2C1810', marginBottom: 4 },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorName: { width: 60, fontSize: 13, color: '#333' },
  colorElement: { width: 30, fontSize: 12, color: '#888' },
  colorBarBg: { flex: 1, height: 6, backgroundColor: '#F0E8D0', borderRadius: 3, overflow: 'hidden' },
  colorBarFill: { height: '100%', backgroundColor: '#C9A84C', borderRadius: 3 },
  colorPct: { width: 36, fontSize: 12, color: '#888', textAlign: 'right' },

  adviceCard: {
    backgroundColor: '#FFF8E7',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#C9A84C',
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
