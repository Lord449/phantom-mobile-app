import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/i18n";
import { useColors } from "@/hooks/useColors";
import { checkHealth } from "@/lib/api";

export default function SetupScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { setServerUrl } = useAuth();
  const { t } = useI18n();
  const [url, setUrl] = useState("http://");
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleConnect() {
    const trimmed = url.trim().replace(/\/$/, "");
    if (!trimmed || trimmed === "http://" || trimmed === "https://") {
      setErrorMsg(t.enterServer);
      setStatus("error");
      return;
    }
    setTesting(true);
    setStatus("idle");
    setErrorMsg("");
    try {
      const ok = await checkHealth(trimmed);
      if (ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await setServerUrl(trimmed);
        router.replace("/login");
      } else {
        setStatus("error");
        setErrorMsg(t.serverNotResponding);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setStatus("error");
      setErrorMsg(t.connectError);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setTesting(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={[styles.logoBox, { borderColor: c.primary + "44", backgroundColor: c.card }]}>
              <Feather name="shield" size={48} color={c.primary} />
            </View>
            <Text style={[styles.logoText, { color: c.primary }]}>{t.appName}</Text>
            <Text style={[styles.logoSub, { color: c.mutedForeground }]}>{t.appSub}</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.foreground }]}>{t.setupTitle}</Text>
            <Text style={[styles.cardSub, { color: c.mutedForeground }]}>{t.setupSub}</Text>

            <View style={[styles.inputWrap, { backgroundColor: c.input, borderColor: status === "error" ? c.destructive : c.border }]}>
              <Feather name="server" size={16} color={c.mutedForeground} />
              <TextInput
                style={[styles.input, { color: c.foreground }]}
                value={url}
                onChangeText={setUrl}
                placeholder={t.serverPlaceholder}
                placeholderTextColor={c.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="done"
                onSubmitEditing={handleConnect}
              />
            </View>

            {status === "error" && (
              <View style={[styles.msgBox, { backgroundColor: c.destructive + "18" }]}>
                <Feather name="alert-circle" size={14} color={c.destructive} />
                <Text style={[styles.msgText, { color: c.destructive }]}>{errorMsg}</Text>
              </View>
            )}
            {status === "ok" && (
              <View style={[styles.msgBox, { backgroundColor: c.success + "18" }]}>
                <Feather name="check-circle" size={14} color={c.success} />
                <Text style={[styles.msgText, { color: c.success }]}>{t.connectSuccess}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [styles.btn, { backgroundColor: c.primary, opacity: pressed ? 0.8 : 1 }]}
              onPress={handleConnect}
              disabled={testing}
            >
              {testing
                ? <ActivityIndicator color={c.primaryForeground} size="small" />
                : (
                  <>
                    <Feather name="zap" size={16} color={c.primaryForeground} />
                    <Text style={[styles.btnText, { color: c.primaryForeground }]}>{t.connectBtn}</Text>
                  </>
                )}
            </Pressable>
          </View>

          <Text style={[styles.hint, { color: c.mutedForeground }]}>{t.serverHint}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 24 },
  logoArea: { alignItems: "center", gap: 12, marginBottom: 8 },
  logoBox: { width: 96, height: 96, borderRadius: 24, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: 6 },
  logoSub: { fontSize: 13, fontFamily: "Inter_400Regular", letterSpacing: 2 },
  card: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 14 },
  cardTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  cardSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, gap: 10, height: 48 },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 12 },
  btnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  msgBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8 },
  msgText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  hint: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
