import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ symbol, label, focused }: { symbol: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabSymbol, focused && styles.tabSymbolActive]}>{symbol}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="壁" label="今日" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="测" label="测试" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="缘" label="配对" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="历" label="日历" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="我" label="我的" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFEF8',
    borderTopColor: '#F0E8D0',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabSymbol: {
    fontSize: 18,
    color: '#B8A88A',
    fontWeight: '600',
  },
  tabSymbolActive: {
    color: '#C9A84C',
  },
  tabLabel: {
    fontSize: 10,
    color: '#B8A88A',
  },
  tabLabelActive: {
    color: '#C9A84C',
    fontWeight: '600',
  },
});
