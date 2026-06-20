import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface ToolCardProps {
  name: string;
  description: string;
  category: string;
  tier: string;
  onPress: () => void;
}

const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  network: "wifi",
  security: "shield",
  auth: "lock",
  ai: "cpu",
  audit: "file-text",
  database: "database",
  monitoring: "activity",
  default: "tool",
};

const TIER_COLOR: Record<string, string> = {
  basic: "#6b85a0",
  pro: "#00c8ff",
  enterprise: "#f59e0b",
  trial: "#888",
};

export function ToolCard({ name, description, category, tier, onPress }: ToolCardProps) {
  const c = useColors();
  const icon = CATEGORY_ICONS[category.toLowerCase()] ?? CATEGORY_ICONS.default;
  const tierColor = TIER_COLOR[tier.toLowerCase()] ?? TIER_COLOR.basic;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.75 : 1 },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={[styles.iconBox, { backgroundColor: c.primary + "18" }]}>
        <Feather name={icon} size={20} color={c.primary} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: c.foreground }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.desc, { color: c.mutedForeground }]} numberOfLines={2}>
          {description}
        </Text>
      </View>
      <View style={[styles.tier, { backgroundColor: tierColor + "22" }]}>
        <Text style={[styles.tierText, { color: tierColor }]}>{tier.toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 8,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  desc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  tier: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tierText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
});
