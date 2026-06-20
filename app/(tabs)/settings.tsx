import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { type Lang, useI18n } from "@/context/i18n";
import { useNotifications } from "@/context/NotificationContext";
import { useColors } from "@/hooks/useColors";

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
  danger?: boolean;
  right?: React.ReactNode;
}

function SettingRow({ icon, label, value, onPress, color, danger, right }: SettingRowProps) {
  const c = useColors();
  const acc = color ?? (danger ? c.destructive : c.primary);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.card, borderColor: c.border, opacity: pressed && !!onPress ? 0.75 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: acc + "18" }]}>
        <Feather name={icon} size={16} color={acc} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? c.destructive : c.foreground }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {right ?? (
          <>
            {value ? <Text style={[styles.rowValue, { color: c.mutedForeground }]} numberOfLines={1}>{value}</Text> : null}
            {onPress ? <Feather name="chevron-right" size={14} color={c.mutedForeground} /> : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  const c = useColors();
  return <Text style={[styles.section, { color: c.mutedForeground }]}>{title}</Text>;
}

const LANG_OPTIONS: { value: Lang; flag: string; label: string }[] = [
  { value: "ar", flag: "🇸🇦", label: "العربية" },
  { value: "en", flag: "🇺🇸", label: "English" },
  { value: "fr", flag: "🇫🇷", label: "Français" },
  { value: "tr", flag: "🇹🇷", label: "Türkçe" },
];

export default function SettingsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user, serverUrl, logout, tier } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { enabled: notifEnabled, toggle: toggleNotif, requestPermission } = useNotifications();

  const TOP = insets.top + (Platform.OS === "web" ? 67 : 0);
  const BOTTOM = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 70;

  const TIER_LABEL: Record<string, string> = {
    trial: t.tierTrial,
    basic: t.tierBasic,
    pro: t.tierPro,
    enterprise: t.tierEnterprise,
  };

  function handleLogout() {
    if (Platform.OS === "web") {
      logout().then(() => router.replace("/login"));
      return;
    }
    Alert.alert(t.logout, t.logoutConfirm, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.logout,
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
          router.replace("/login");
        },
      },
    ]);
  }

  async function handleNotifToggle() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!notifEnabled) await requestPermission();
    toggleNotif();
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: TOP + 14, backgroundColor: c.background, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.foreground }]}>{t.settingsTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BOTTOM }]} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={[styles.profileCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.avatar, { backgroundColor: c.primary + "22", borderColor: c.primary + "44" }]}>
            <Text style={[styles.avatarText, { color: c.primary }]}>
              {(user?.username ?? "A").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: c.foreground }]}>{user?.username ?? "Admin"}</Text>
            <Text style={[styles.profileEmail, { color: c.mutedForeground }]}>{user?.email ?? "—"}</Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: c.primary + "18", borderColor: c.primary + "44" }]}>
            <Text style={[styles.roleText, { color: c.primary }]}>{(user?.role ?? "admin").toUpperCase()}</Text>
          </View>
        </View>

        {/* Language — 4 options */}
        <SectionTitle title={t.language} />
        <View style={[styles.langGrid, { backgroundColor: c.card, borderColor: c.border }]}>
          {LANG_OPTIONS.map((l) => {
            const active = lang === l.value;
            return (
              <Pressable
                key={l.value}
                style={({ pressed }) => [
                  styles.langBtn,
                  {
                    backgroundColor: active ? c.primary : c.secondary,
                    borderColor: active ? c.primary : c.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLang(l.value);
                }}
              >
                <Text style={styles.langFlag}>{l.flag}</Text>
                <Text style={[styles.langLabel, { color: active ? c.primaryForeground : c.mutedForeground }]}>
                  {l.label}
                </Text>
                {active && <Feather name="check" size={12} color={c.primaryForeground} />}
              </Pressable>
            );
          })}
        </View>

        {/* Notifications */}
        <SectionTitle title={t.notifications} />
        <SettingRow
          icon="bell"
          label={t.notifications}
          color={c.accent}
          right={
            <Switch
              value={notifEnabled}
              onValueChange={handleNotifToggle}
              trackColor={{ false: c.border, true: c.primary }}
              thumbColor={notifEnabled ? "#0a0e1a" : c.mutedForeground}
            />
          }
        />

        {/* License */}
        <SectionTitle title={t.licensePlan} />
        <SettingRow icon="award" label={t.licensePlan} value={TIER_LABEL[tier] ?? tier} />
        <SettingRow icon="key" label={t.keyManagement} onPress={() => {}} />
        <SettingRow icon="refresh-cw" label={t.renewLicense} onPress={() => {}} color={c.accent} />

        {/* Connection */}
        <SectionTitle title={t.connection} />
        <SettingRow
          icon="server"
          label={t.server}
          value={serverUrl.replace(/https?:\/\//, "").slice(0, 28) || "—"}
        />
        <SettingRow icon="shuffle" label={t.changeServer} onPress={() => router.replace("/setup")} color={c.accent} />

        {/* Security */}
        <SectionTitle title={t.securitySection} />
        <SettingRow icon="shield" label={t.wafSettings} onPress={() => {}} />
        <SettingRow icon="lock" label={t.passwordPolicy} onPress={() => {}} />
        <SettingRow icon="bell" label={t.alertSettings} onPress={() => {}} />
        <SettingRow icon="file-text" label={t.auditLogs} onPress={() => {}} />

        {/* App */}
        <SectionTitle title={t.appSection} />
        <SettingRow icon="info" label={t.version} value="v3.0.0" />
        <SettingRow icon="book-open" label={t.help} onPress={() => {}} color={c.accent} />
        <SettingRow icon="log-out" label={t.logout} onPress={handleLogout} danger />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 8 },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontFamily: "Inter_700Bold" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  profileEmail: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  roleText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  section: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase", marginTop: 8, marginBottom: 2, marginLeft: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 10, borderWidth: 1, padding: 13 },
  rowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: { fontSize: 12, fontFamily: "Inter_400Regular", maxWidth: 120 },
  langGrid: { borderRadius: 14, borderWidth: 1, padding: 8, gap: 6, flexDirection: "row", flexWrap: "wrap" },
  langBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, minWidth: "47%" },
  langFlag: { fontSize: 18 },
  langLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", flex: 1 },
});
