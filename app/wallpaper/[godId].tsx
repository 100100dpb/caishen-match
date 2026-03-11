import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Share,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { cacheDirectory, downloadAsync } from 'expo-file-system/legacy';
import { GODS, GodId } from '../../constants/gods';
import { buildWallpaperUrl } from '../../lib/wallpaperService';

const { width, height } = Dimensions.get('window');

export default function WallpaperDetailScreen() {
  const { godId } = useLocalSearchParams<{ godId: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const god = godId ? GODS[godId as GodId] : undefined;
  if (!god) {
    return (
      <View style={styles.center}>
        <Text>财神未找到</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const wallpaperUrl = buildWallpaperUrl(god.id);

  async function saveWallpaper() {
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要相册权限', '请在设置中允许访问相册以保存壁纸');
        return;
      }

      // Download and save
      const localUri = await downloadImage(wallpaperUrl);
      if (localUri) {
        await MediaLibrary.saveToLibraryAsync(localUri);
        Alert.alert('保存成功', `${god!.name}壁纸已保存到相册！`);
      } else {
        Alert.alert('提示', '壁纸图片尚未上传，敬请期待！');
      }
    } catch (e) {
      Alert.alert('保存失败', '请稍后重试');
    } finally {
      setSaving(false);
    }
  }

  async function shareWallpaper() {
    try {
      await Share.share({
        message: `我的专属财神是【${god!.name}】— ${god!.title}\n${god!.description}\n\n来财神配对App测测你的财神 →`,
        title: `${god!.name} 壁纸`,
      });
    } catch {}
  }

  return (
    <View style={styles.container}>
      {/* Wallpaper Preview */}
      <View style={[styles.preview, { backgroundColor: god.bgColor }]}>
        <Image
          source={{ uri: wallpaperUrl }}
          style={styles.previewImage}
          resizeMode="cover"
          onError={() => {}} // silently fail
        />
        <View style={styles.previewOverlay}>
          <Text style={[styles.previewName, { color: god.color }]}>{god.name}</Text>
          <Text style={styles.previewTitle}>{god.title}</Text>
          <Text style={styles.watermark}>财神配对</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.sheet}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <Text style={[styles.sheetName, { color: god.color }]}>{god.name}</Text>
        <Text style={styles.sheetTitle}>{god.title}</Text>
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
          >
            <Text style={[styles.shareBtnText, { color: god.color }]}>分享</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

async function downloadImage(url: string): Promise<string | null> {
  try {
    const filename = url.split('/').pop() || 'wallpaper.jpg';
    const fileUri = `${cacheDirectory ?? ''}${filename}`;
    const { uri } = await downloadAsync(url, fileUri);
    return uri;
  } catch {
    return null;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  back: { color: '#C9A84C', fontSize: 16 },

  preview: {
    height: height * 0.6,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: { position: 'absolute', width: '100%', height: '100%' },
  previewOverlay: { alignItems: 'center' },
  previewName: { fontSize: 72, fontWeight: '800', letterSpacing: 4 },
  previewTitle: { fontSize: 16, color: '#555', marginTop: 8 },
  watermark: {
    position: 'absolute',
    bottom: -height * 0.25,
    right: 0,
    fontSize: 11,
    color: 'rgba(0,0,0,0.3)',
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  sheet: {
    flex: 1,
    backgroundColor: '#FFFEF8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 20,
  },
  closeBtn: { position: 'absolute', top: 16, right: 20, padding: 8 },
  closeBtnText: { fontSize: 18, color: '#888' },
  sheetName: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  sheetTitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 8 },
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
