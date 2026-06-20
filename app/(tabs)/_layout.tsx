import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useI18n } from "@/context/i18n";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const c = useColors();
  const { t } = useI18n();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : c.background,
          borderTopWidth: 1,
          borderTopColor: c.border,
          elevation: 0,
          height: isWeb ? 84 : 62,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: c.card }]} />
          ),
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 10, marginBottom: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t.tabDashboard, tabBarIcon: ({ color }) => <Feather name="activity" size={22} color={color} /> }} />
      <Tabs.Screen name="tools" options={{ title: t.tabTools, tabBarIcon: ({ color }) => <Feather name="tool" size={22} color={color} /> }} />
      <Tabs.Screen name="security" options={{ title: t.tabSecurity, tabBarIcon: ({ color }) => <Feather name="shield" size={22} color={color} /> }} />
      <Tabs.Screen name="ai" options={{ title: t.tabAI, tabBarIcon: ({ color }) => <Feather name="cpu" size={22} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: t.tabSettings, tabBarIcon: ({ color }) => <Feather name="settings" size={22} color={color} /> }} />
    </Tabs>
  );
}
