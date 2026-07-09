import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WallpaperParams, WALLPAPER_ASPECT } from '../lib/wallpaperComposer';

interface Props {
  params: WallpaperParams;
  width: number; // 渲染宽度（逻辑像素），高度按壁纸比例自动计算
  showBrand?: boolean; // 分享模式：底部品牌条
}

// 设计基准逻辑宽度，所有尺寸按 width/430 缩放
const DESIGN_WIDTH = 430;

export const WallpaperCanvas = forwardRef<View, Props>(function WallpaperCanvas(
  { params, width, showBrand = false },
  ref
) {
  const height = width / WALLPAPER_ASPECT;
  const s = width / DESIGN_WIDTH;

  return (
    <View ref={ref} collapsable={false} style={{ width, height }}>
      <LinearGradient
        colors={params.bgGradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* 顶部：节日 + 农历日期 */}
      <View style={[styles.top, { paddingTop: 90 * s, gap: 10 * s }]}>
        {params.festivalText && (
          <View
            style={[
              styles.festivalBadge,
              {
                borderColor: params.textColor,
                paddingHorizontal: 14 * s,
                paddingVertical: 5 * s,
                borderRadius: 18 * s,
                borderWidth: Math.max(1, s),
              },
            ]}
          >
            <Text style={{ color: params.textColor, fontSize: 15 * s, fontWeight: '600' }}>
              {params.festivalText}
            </Text>
          </View>
        )}
        <Text style={{ color: params.textColor, fontSize: 14 * s, opacity: 0.85, letterSpacing: 2 * s }}>
          {params.dateText}
        </Text>
      </View>

      {/* 中部：光环 + 竖排财神名 */}
      <View style={styles.center}>
        <View
          style={{
            width: 260 * s,
            height: 260 * s,
            borderRadius: 130 * s,
            borderWidth: 2 * s,
            borderColor: params.accentColor,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.04)',
          }}
        >
          <View
            style={{
              width: 232 * s,
              height: 232 * s,
              borderRadius: 116 * s,
              borderWidth: Math.max(1, 0.5 * s),
              borderColor: params.accentColor,
              opacity: 0.9,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: params.textColor,
                fontSize: (params.godName.length > 3 ? 44 : 58) * s,
                fontWeight: '800',
                letterSpacing: 4 * s,
              }}
            >
              {params.godName}
            </Text>
          </View>
        </View>
        <Text
          style={{
            color: params.textColor,
            fontSize: 16 * s,
            opacity: 0.9,
            marginTop: 22 * s,
            letterSpacing: 3 * s,
          }}
        >
          {params.godTitle}
        </Text>
      </View>

      {/* 底部：吉语 + 水印 */}
      <View style={[styles.bottom, { paddingBottom: (showBrand ? 70 : 110) * s, gap: 8 * s }]}>
        <Text
          style={{
            color: params.textColor,
            fontSize: 22 * s,
            fontWeight: '700',
            letterSpacing: 4 * s,
          }}
        >
          {params.blessing}
        </Text>
        <Text
          style={{
            color: params.textColor,
            fontSize: 11 * s,
            opacity: 0.45,
            letterSpacing: 2 * s,
          }}
        >
          财神配对
        </Text>
      </View>

      {showBrand && (
        <View
          style={[
            styles.brandBar,
            { height: 52 * s, paddingHorizontal: 20 * s },
          ]}
        >
          <Text style={{ color: '#FFE8B0', fontSize: 14 * s, fontWeight: '700' }}>财神配对</Text>
          <Text style={{ color: '#FFE8B0', fontSize: 12 * s, opacity: 0.8 }}>
            测测你的专属财神
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  top: { alignItems: 'center' },
  festivalBadge: { alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottom: { alignItems: 'center' },
  brandBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20,5,5,0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
