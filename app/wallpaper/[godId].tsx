import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { GODS, GodId } from '../../constants/gods';
import {
  composeParams,
  WALLPAPER_WIDTH,
  WALLPAPER_HEIGHT,
  WALLPAPER_ASPECT,
} from '../../lib/wallpaperComposer';
import { WallpaperCanvas } from '../../components/WallpaperCanvas';

const { width: screenWidth } = Dimensions.get('window');

// 导出用画布逻辑宽度：430 × pixelRatio(3) ≈ 1290 物理像素
const EXPORT_WIDTH = 430;

export default function WallpaperDetailScreen() {
  const { godId } = useLocalSearchParams<{ godId: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const exportRef = useRef<View>(null);
  const shareRef = useRef<View>(null);

  const god = godId ? GODS[godId as GodId] : undefined;
  const params = useMemo(
    () => (god ? composeParams(god.id, new Date()) : null),
    [god?.id]
  );

  if (!god || !params) {
    return (
      <View style={styles.center}>
        <Text>财神未找到</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function captureView(ref: React.RefObject<View | null>): Promise<string> {
    return captureRef(ref, {
      format: 'png',
      quality: 1,
      width: WALLPAPER_WIDTH,
      height: WALLPAPER_HEIGHT,
    });
  }

  async function saveWallpaper() {
    setSaving(true);
    try {
      const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '需要相册权限',
          '请允许访问相册以保存壁纸',
          canAskAgain
            ? undefined
            : [
                { text: '取消', style: 'cancel' },
                { text: '去设置', onPress: () => Linking.openSettings() },
              ]
        );
        return;
      }

      const uri = await captureView(exportRef);
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('保存成功', `${god!.name}壁纸已保存到相册！`);
    } catch {
      Alert.alert('保存失败', '请稍后重试');
    } finally {
      setSaving(false);
    }
  }

  async function shareWallpaper() {
    setSharing(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('提示', '当前设备不支持分享');
        return;
      }
      const uri = await captureView(shareRef);
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `${god!.name} · 财神配对`,
      });
    } catch {
      // 用户取消分享也会抛错，静默处理
    } finally {
      setSharing(false);
    }
  }

  const previewWidth = Math.min(screenWidth * 0.62, 280);

  return (
    <View style={styles.container}>
      {/* 隐藏的导出画布（全尺寸捕获用） */}
      <View style={styles.offscreen} pointerEvents="none">
        <WallpaperCanvas ref={exportRef} params={params} width={EXPORT_WIDTH} />
        <WallpaperCanvas ref={shareRef} params={params} width={EXPORT_WIDTH} showBrand />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 壁纸预览 */}
        <View style={styles.previewWrap}>
          <View style={[styles.previewShadow, { width: previewWidth, height: previewWidth / WALLPAPER_ASPECT }]}>
            <WallpaperCanvas params={params} width={previewWidth} />
          </View>
        </View>

        {/* 信息区 */}
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <Text style={[styles.sheetName, { color: god.color }]}>{god.name}</Text>
          <Text style={styles.sheetTitle}>{god.title}</Text>
          <Text style={styles.sheetBlessing}>「{params.blessing}」</Text>
          <Text style={styles.sheetDesc}>{god.description}</Text>

          <View style={styles.tagRow}>
            {god.tags.map(tag => (
              <View key={tag} style={[styles.tag, { borderColor: god.color }]}>
                <Text style={[styles.tagText, { color: god.color }]}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: god.color }]}
              onPress={saveWallpaper}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>保存到相册</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shareBtn, { borderColor: god.color }]}
              onPress={shareWallpaper}
              disabled={sharing}
            >
              {sharing ? (
                <ActivityIndicator color={god.color} />
              ) : (
                <Text style={[styles.shareBtnText, { color: god.color }]}>分享</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171310' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  back: { color: '#C9A84C', fontSize: 16 },

  // 移出屏幕但保持已布局，供 view-shot 捕获
  offscreen: { position: 'absolute', left: -9999, top: 0 },

  scrollContent: { flexGrow: 1 },
  previewWrap: { alignItems: 'center', paddingTop: 48, paddingBottom: 24 },
  previewShadow: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },

  sheet: {
    flex: 1,
    backgroundColor: '#FFFEF8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 20,
  },
  closeBtn: { position: 'absolute', top: 16, right: 20, padding: 8, zIndex: 1 },
  closeBtnText: { fontSize: 18, color: '#888' },
  sheetName: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  sheetTitle: { fontSize: 14, color: '#666', marginTop: 4 },
  sheetBlessing: { fontSize: 15, color: '#8B6914', fontWeight: '600', marginTop: 10, marginBottom: 6 },
  sheetDesc: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '500' },

  actions: { flexDirection: 'row', gap: 10 },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  shareBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  shareBtnText: { fontSize: 16, fontWeight: '700' },
});
