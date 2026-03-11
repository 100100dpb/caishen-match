import AsyncStorage from '@react-native-async-storage/async-storage';
import { GodId } from '../constants/gods';
import { getLunarInfo } from './lunarHelper';

const CDN_BASE = 'https://cdn.yourdomain.com/wallpapers';
const MANIFEST_URL = `${CDN_BASE}/../manifest.json`;
const MANIFEST_CACHE_KEY = 'wallpaper_manifest';
const MANIFEST_CACHE_TIME_KEY = 'wallpaper_manifest_time';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface WallpaperEntry {
  id: string;
  godId: GodId;
  type: 'daily' | 'festival' | 'element' | 'season';
  day?: number;
  url: string;
  element?: string;
  season?: string;
  festival?: string;
  tags: string[];
}

export interface WallpaperManifest {
  version: string;
  updated: string;
  wallpapers: WallpaperEntry[];
}

export async function getManifest(): Promise<WallpaperManifest | null> {
  try {
    const cachedTime = await AsyncStorage.getItem(MANIFEST_CACHE_TIME_KEY);
    if (cachedTime) {
      const age = Date.now() - Number(cachedTime);
      if (age < CACHE_TTL_MS) {
        const cached = await AsyncStorage.getItem(MANIFEST_CACHE_KEY);
        if (cached) return JSON.parse(cached);
      }
    }

    const res = await fetch(MANIFEST_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const manifest: WallpaperManifest = await res.json();

    await AsyncStorage.setItem(MANIFEST_CACHE_KEY, JSON.stringify(manifest));
    await AsyncStorage.setItem(MANIFEST_CACHE_TIME_KEY, String(Date.now()));

    return manifest;
  } catch {
    // Return cached even if expired, as fallback
    const cached = await AsyncStorage.getItem(MANIFEST_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  }
}

export function buildWallpaperUrl(godId: GodId, type: string = 'daily', variant?: string): string {
  const lunar = getLunarInfo();
  const day = String(lunar.day).padStart(2, '0');

  if (type === 'festival' && lunar.festival) {
    return `${CDN_BASE}/festival/${godId}_festival_${lunar.festival}.jpg`;
  }
  if (type === 'element' && variant) {
    return `${CDN_BASE}/element/${godId}_${variant}.jpg`;
  }
  return `${CDN_BASE}/daily/${godId}_daily_${day}.jpg`;
}

export function getTodayWallpaper(
  godId: GodId,
  manifest: WallpaperManifest | null
): WallpaperEntry | null {
  if (!manifest) {
    // Return synthetic entry pointing to CDN
    const url = buildWallpaperUrl(godId);
    return { id: `${godId}_today`, godId, type: 'daily', url, tags: [] };
  }

  const lunar = getLunarInfo();

  // Try festival first
  if (lunar.festival) {
    const fest = manifest.wallpapers.find(
      w => w.godId === godId && w.type === 'festival' && w.festival === lunar.festival
    );
    if (fest) return fest;
  }

  // Try daily
  const daily = manifest.wallpapers.find(
    w => w.godId === godId && w.type === 'daily' && w.day === lunar.day
  );
  if (daily) return daily;

  // Fallback — any wallpaper for this god
  const any = manifest.wallpapers.find(w => w.godId === godId);
  return any || null;
}
