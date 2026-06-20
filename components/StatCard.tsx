import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  color?: string;
  sub?: string;
}

export function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  const c = useColors();
  const accent = color ?? c.primary;

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={[styles.iconBox, { backgroundColor: accent + "22" }]}>
        <Feather name={icon} size={18} color={accent} />
      </View>
      <Text style={[styles.value, { color: c.foreground }]}>{value}</Text>
      <Text style={[styles.label, { color: c.mutedForeground }]}>{label}</Text>
      {sub ? <Text style={[styles.sub, { color: accent }]}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    minWidth: 140,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  sub: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
