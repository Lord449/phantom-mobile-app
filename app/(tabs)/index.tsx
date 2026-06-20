import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlertRow } from "@/components/AlertRow";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/i18n";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

interface DashboardData {
  requests: { total: number; blocked: number; allowed: number };
  threats: { critical: number; high: number; medium: number };
  uptime: string;
  license: { tier: string; valid: boolean };
  recentAlerts: Array<{
    id: string;
    title: string;
    message: string;
    severity: "critical" | "high" | "medium" | "low" | "info";
    time: string;
  }>;
}

const MOCK: DashboardData = {
  requests: { total: 14832, blocked: 293, allowed: 14539 },
  threats: { critical: 2, high: 7, medium: 21 },
  uptime: "99.8%",
  license: { tier: "pro", valid: true },
  recentAlerts: [
    { id: "1", title: "SQL Injection Attempt", message: "Blocked from 185.220.101.5 on /api/users", severity: "critical", time: "2m ago" },
    { id: "2", title: "Brute Force Detected", message: "12 failed logins from 10.0.0.44", severity: "high", time: "8m ago" },
    { id: "3", title: "XSS Pattern Blocked", message: "Script injection in search parameter", severity: "medium", time: "14m ago" },
    { id: "4", title: "Rate Limit Hit", message: "User ID 8821 exceeded 1000 req/min", severity: "low", time: "22m ago" },
  ],
};

export default function DashboardScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useI18n();

  const TOP = insets.top + (Platform.OS === "web" ? 67 : 0);
  const BOTTOM = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 70;

  const { data, isLoading, refetch, isFetching, isError } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/api/v1/dashboard"),
    refetchInterval: 15000,
    retry: 1,
  });

  const d = isError || !data ? MOCK : data;
  const isDemo = isError || !data;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: TOP + 14, backgroundColor: c.background, borderBottomColor: c.border }]}>
        <View>
          <Text style={[styles.greeting, { color: c.mutedForeground }]}>{t.greeting}</Text>
          <Text style={[styles.username, { color: c.foreground }]}>{user?.username ?? "Admin"}</Text>
        </View>
        <View style={styles.headerRight}>
          {isDemo && (
            <View style={[styles.demoBadge, { backgroundColor: c.warning + "22", borderColor: c.warning + "44" }]}>
              <Text style={[styles.demoBadgeText, { color: c.warning }]}>{t.demoMode}</Text>
            </View>
          )}
          <View style={[styles.statusDot, { backgroundColor: c.primary }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: BOTTOM }]}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={c.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={c.primary} size="large" />
            <Text style={[styles.loadingText, { color: c.mutedForeground }]}>{t.loading}</Text>
          </View>
        ) : (
          <>
            {/* License Badge */}
            <View style={[styles.licenseBadge, { backgroundColor: c.primary + "18", borderColor: c.primary + "44" }]}>
              <Feather name="award" size={13} color={c.primary} />
              <Text style={[styles.licenseText, { color: c.primary }]}>
                {d.license.tier.toUpperCase()} — {d.license.valid ? t.active : t.expired}
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatCard label={t.totalRequests} value={d.requests.total.toLocaleString()} icon="activity" color={c.primary} />
              <StatCard
                label={t.blocked}
                value={d.requests.blocked}
                icon="slash"
                color={c.destructive}
                sub={`${((d.requests.blocked / Math.max(d.requests.total, 1)) * 100).toFixed(1)}%`}
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard label={t.critical} value={d.threats.critical} icon="alert-octagon" color="#ff2222" />
              <StatCard label={t.high} value={d.threats.high} icon="alert-triangle" color="#ff6600" />
              <StatCard label={t.medium} value={d.threats.medium} icon="alert-circle" color="#f59e0b" />
            </View>

            {/* Uptime */}
            <View style={[styles.uptimeCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <Feather name="server" size={16} color={c.primary} />
              <Text style={[styles.uptimeLabel, { color: c.mutedForeground }]}>{t.uptime}</Text>
              <Text style={[styles.uptimeValue, { color: c.primary }]}>{d.uptime}</Text>
            </View>

            {/* Alerts */}
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>{t.recentAlerts}</Text>
            {d.recentAlerts.map((a) => (
              <AlertRow key={a.id} title={a.title} message={a.message} severity={a.severity} time={a.time} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  greeting: { fontSize: 12, fontFamily: "Inter_400Regular" },
  username: { fontSize: 18, fontFamily: "Inter_700Bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  demoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  demoBadgeText: { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  loadingBox: { alignItems: "center", gap: 12, marginTop: 60 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  licenseBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, alignSelf: "flex-start" },
  licenseText: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  statsRow: { flexDirection: "row", gap: 10 },
  uptimeCard: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  uptimeLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  uptimeValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 4 },
});
