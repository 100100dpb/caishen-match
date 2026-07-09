import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { scheduleDailyReminder } from '../lib/notifications';
import { useUserStore } from '../store/userStore';
import { GODS } from '../constants/gods';

export default function RootLayout() {
  const router = useRouter();
  const notificationsEnabled = useUserStore(s => s.profile.notificationsEnabled);
  const topGodId = useUserStore(s => s.profile.godRanking[0]?.godId);

  useEffect(() => {
    if (notificationsEnabled) {
      scheduleDailyReminder(topGodId ? GODS[topGodId].name : undefined);
    }
  }, [notificationsEnabled, topGodId]);

  useEffect(() => {
    // 点击通知 → 回到今日页
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.navigate('/(tabs)');
    });
    return () => sub.remove();
  }, [router]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quiz/index" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="quiz/result" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="wallpaper/[godId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="outfit/index" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
