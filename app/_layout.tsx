import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { scheduleDailyReminder } from '../lib/notifications';
import { useUserStore } from '../store/userStore';

export default function RootLayout() {
  const notificationsEnabled = useUserStore(s => s.profile.notificationsEnabled);

  useEffect(() => {
    if (notificationsEnabled) {
      scheduleDailyReminder();
    }
  }, [notificationsEnabled]);

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
