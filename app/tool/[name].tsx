import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

export default function ToolDetailScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { name: toolId, title, desc, tier } = useLocalSearchParams<{
    name: string;
    title: string;
    desc: string;
    tier: string;
  }>();

  const [target, setTarget] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const TOP = insets.top + (Platform.OS === "web" ? 67 : 0);
  const BOTTOM = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const TIER_COLOR: Record<string, string> = {
    basic: "#6b85a0",
    pro: "#00c8ff",
    enterprise: "#f59e0b",
  };
  const tierColor = TIER_COLOR[(tier ?? "basic").toLowerCase()] ?? "#6b85a0";

  async function runTool() {
    if (running) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.post<{ result: string; output: string }>("/api/v1/tools/run", {
        tool: toolId,
        target: target.trim(),
      });
      setResult(res.result ?? res.output ?? JSON.stringify(res, null, 2));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "فشل تشغيل الأداة";
      setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setRunning(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: TOP + 14, backgroundColor: c.card, borderBottomColor: c.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={20} color={c.foreground} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={[styles.toolTitle, { color: c.foreground }]} numberOfLines={1}>{title}</Text>
          <View style={[styles.tierBadge, { backgroundColor: tierColor + "22" }]}>
            <Text style={[styles.tierBadgeText, { color: tierColor }]}>{(tier ?? "basic").toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: BOTTOM + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View style={[styles.descCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.descText, { color: c.mutedForeground }]}>{desc}</Text>
        </View>

        {/* Input */}
        <View style={[styles.inputCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.inputLabel, { color: c.foreground }]}>الهدف / المدخل</Text>
          <View style={[styles.inputWrap, { backgroundColor: c.input, borderColor: c.border }]}>
            <Feather name="target" size={14} color={c.mutedForeground} />
            <TextInput
              style={[styles.textInput, { color: c.foreground }]}
              placeholder="IP، URL، معامل، أو نص للفحص..."
              placeholderTextColor={c.mutedForeground}
              value={target}
              onChangeText={setTarget}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.runBtn,
              { backgroundColor: c.primary, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={runTool}
            disabled={running}
          >
            {running ? (
              <>
                <ActivityIndicator size="small" color={c.primaryForeground} />
                <Text style={[styles.runBtnText, { color: c.primaryForeground }]}>جاري التشغيل...</Text>
              </>
            ) : (
              <>
                <Feather name="play" size={15} color={c.primaryForeground} />
                <Text style={[styles.runBtnText, { color: c.primaryForeground }]}>تشغيل الأداة</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Result */}
        {result != null && (
          <View style={[styles.resultCard, { backgroundColor: "#0a1a0a", borderColor: c.primary + "44" }]}>
            <View style={styles.resultHeader}>
              <Feather name="terminal" size={14} color={c.primary} />
              <Text style={[styles.resultLabel, { color: c.primary }]}>النتيجة</Text>
            </View>
            <Text style={[styles.resultText, { color: "#00ff88" }]}>{result}</Text>
          </View>
        )}

        {error != null && (
          <View style={[styles.errorCard, { backgroundColor: c.destructive + "12", borderColor: c.destructive + "44" }]}>
            <Feather name="alert-circle" size={14} color={c.destructive} />
            <Text style={[styles.errorText, { color: c.destructive }]}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  toolTitle: { flex: 1, fontSize: 16, fontFamily: "Inter_700Bold" },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tierBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  content: { padding: 16, gap: 14 },
  descCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  descText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  inputCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 12 },
  inputLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    minHeight: 36,
  },
  runBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
  },
  runBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  resultCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  resultLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  resultText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 20 },
  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  errorText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 19 },
});
