import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Severity = "critical" | "high" | "medium" | "low" | "info";

interface AlertRowProps {
  title: string;
  message: string;
  severity: Severity;
  time?: string;
}

const SEV_COLOR: Record<Severity, string> = {
  critical: "#ff2222",
  high: "#ff6600",
  medium: "#f59e0b",
  low: "#00c8ff",
  info: "#6b85a0",
};

const SEV_ICON: Record<Severity, keyof typeof Feather.glyphMap> = {
  critical: "alert-octagon",
  high: "alert-triangle",
  medium: "alert-circle",
  low: "info",
  info: "bell",
};

export function AlertRow({ title, message, severity, time }: AlertRowProps) {
  const c = useColors();
  const color = SEV_COLOR[severity];

  return (
    <View style={[styles.row, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.foreground }]} numberOfLines={1}>
            {title}
          </Text>
          <View style={[styles.badge, { backgroundColor: color + "22" }]}>
            <Text style={[styles.badgeText, { color }]}>{severity.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={[styles.message, { color: c.mutedForeground }]} numberOfLines={2}>
          {message}
        </Text>
        {time ? (
          <Text style={[styles.time, { color: c.mutedForeground }]}>{time}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    marginBottom: 8,
  },
  dot: {
    width: 3,
    borderRadius: 2,
    minHeight: 40,
  },
  content: { flex: 1, gap: 4 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  message: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  time: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});
