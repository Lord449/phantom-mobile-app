import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlertRow } from "@/components/AlertRow";
import { useI18n } from "@/context/i18n";
import { useColors } from "@/hooks/useColors";

type Severity = "critical" | "high" | "medium" | "low" | "info";
type Filter = "all" | Severity;

interface SecurityEvent {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  time: string;
  ip: string;
}

const EVENTS: SecurityEvent[] = [
  { id: "1", title: "SQL Injection Attempt", message: "SELECT * FROM users WHERE id=1 OR 1=1--", severity: "critical", time: "14:32:01", ip: "185.220.101.5" },
  { id: "2", title: "Brute Force Attack", message: "12 failed login attempts in under 60 seconds", severity: "critical", time: "14:28:44", ip: "45.33.32.156" },
  { id: "3", title: "XSS Pattern Detected", message: "<script>document.cookie</script> in search param", severity: "high", time: "14:21:09", ip: "192.168.1.55" },
  { id: "4", title: "CSRF Token Missing", message: "POST request without valid CSRF token", severity: "high", time: "14:18:55", ip: "10.0.0.99" },
  { id: "5", title: "Path Traversal Attempt", message: "../../etc/passwd in file path parameter", severity: "high", time: "14:10:22", ip: "77.88.55.60" },
  { id: "6", title: "Rate Limit Exceeded", message: "User 8821 exceeded 1000 req/min", severity: "medium", time: "14:05:11", ip: "172.16.0.14" },
  { id: "7", title: "Invalid JWT Token", message: "Forged or expired JWT token detected", severity: "medium", time: "13:58:34", ip: "203.0.113.42" },
  { id: "8", title: "Suspicious User Agent", message: "sqlmap/1.7.2#stable bot detected", severity: "medium", time: "13:45:00", ip: "198.51.100.23" },
  { id: "9", title: "New Device Login", message: "Login from new device for admin account", severity: "low", time: "13:30:17", ip: "192.168.0.1" },
  { id: "10", title: "Slow Health Check", message: "/api/v1/health response > 2s", severity: "info", time: "13:22:08", ip: "localhost" },
];

const SEV_COLORS: Record<Severity, string> = {
  critical: "#ff2222",
  high: "#ff6600",
  medium: "#f59e0b",
  low: "#00c8ff",
  info: "#6b85a0",
};

export default function SecurityScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>("all");

  const TOP = insets.top + (Platform.OS === "web" ? 67 : 0);
  const BOTTOM = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 70;

  const filtered = filter === "all" ? EVENTS : EVENTS.filter((e) => e.severity === filter);

  const counts = EVENTS.reduce((acc, e) => { acc[e.severity] = (acc[e.severity] ?? 0) + 1; return acc; }, {} as Record<string, number>);

  const FILTER_OPTS: { label: string; value: Filter; color: string }[] = [
    { label: t.all, value: "all", color: "#6b85a0" },
    { label: t.critical, value: "critical", color: "#ff2222" },
    { label: t.high, value: "high", color: "#ff6600" },
    { label: t.medium, value: "medium", color: "#f59e0b" },
    { label: t.low, value: "low", color: "#00c8ff" },
    { label: t.info, value: "info", color: "#6b85a0" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: TOP + 14, backgroundColor: c.background, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.foreground }]}>{t.securityTitle}</Text>
        <View style={[styles.liveBadge, { backgroundColor: "#ff222222", borderColor: "#ff222244" }]}>
          <View style={[styles.liveDot, { backgroundColor: "#ff2222" }]} />
          <Text style={[styles.liveText, { color: "#ff2222" }]}>{t.live}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={[styles.summaryRow, { borderBottomColor: c.border }]}>
        {([["critical", "#ff2222"], ["high", "#ff6600"], ["medium", "#f59e0b"], ["low", "#00c8ff"]] as [string, string][]).map(([sev, color]) => (
          <View key={sev} style={styles.summaryItem}>
            <Text style={[styles.summaryCount, { color }]}>{counts[sev] ?? 0}</Text>
            <Text style={[styles.summaryLabel, { color: c.mutedForeground }]}>{t[sev as keyof typeof t] as string}</Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTER_OPTS.map((f) => {
          const active = filter === f.value;
          return (
            <Pressable
              key={f.value}
              style={[styles.chip, { backgroundColor: active ? f.color + "22" : c.card, borderColor: active ? f.color : c.border }]}
              onPress={() => setFilter(f.value)}
            >
              <Text style={[styles.chipText, { color: active ? f.color : c.mutedForeground }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={[styles.list, { paddingBottom: BOTTOM }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="shield" size={32} color={c.mutedForeground} />
            <Text style={[styles.emptyText, { color: c.mutedForeground }]}>{t.noEvents}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AlertRow title={item.title} message={`${item.message}  ·  ${item.ip}`} severity={item.severity} time={item.time} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  summaryRow: { flexDirection: "row", paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryCount: { fontSize: 22, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { alignItems: "center", gap: 10, marginTop: 60 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
