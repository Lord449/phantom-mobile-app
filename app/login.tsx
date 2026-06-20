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

export default function LoginScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { login, serverUrl } = useAuth();
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const serverDisplay = serverUrl.replace(/https?:\/\//, "").replace(/\/$/, "") || "—";

  async function handleLogin() {
    if (!username.trim() || !password) {
      setError(t.fillFields);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(username.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t.loginFailed);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.header}>
            <View style={[styles.logoBox, { borderColor: c.primary + "44", backgroundColor: c.card }]}>
              <Feather name="shield" size={36} color={c.primary} />
            </View>
            <Text style={[styles.title, { color: c.primary }]}>{t.appName}</Text>
            <Text style={[styles.subtitle, { color: c.mutedForeground }]}>{serverDisplay}</Text>
          </View>

          {/* Form */}
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.formTitle, { color: c.foreground }]}>{t.loginTitle}</Text>

            <View style={[styles.fieldWrap, { backgroundColor: c.input, borderColor: c.border }]}>
              <Feather name="user" size={16} color={c.mutedForeground} />
              <TextInput
                style={[styles.field, { color: c.foreground }]}
                placeholder={t.usernamePlaceholder}
                placeholderTextColor={c.mutedForeground}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={[styles.fieldWrap, { backgroundColor: c.input, borderColor: c.border }]}>
              <Feather name="lock" size={16} color={c.mutedForeground} />
              <TextInput
                style={[styles.field, { color: c.foreground }]}
                placeholder={t.passwordPlaceholder}
                placeholderTextColor={c.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable onPress={() => setShowPass(!showPass)} hitSlop={8}>
                <Feather name={showPass ? "eye-off" : "eye"} size={16} color={c.mutedForeground} />
              </Pressable>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: c.destructive + "18" }]}>
                <Feather name="alert-circle" size={14} color={c.destructive} />
                <Text style={[styles.errorText, { color: c.destructive }]}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [styles.loginBtn, { backgroundColor: c.primary, opacity: pressed ? 0.8 : 1 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={c.primaryForeground} size="small" />
                : (
                  <>
                    <Feather name="log-in" size={16} color={c.primaryForeground} />
                    <Text style={[styles.loginBtnText, { color: c.primaryForeground }]}>{t.loginBtn}</Text>
                  </>
                )}
            </Pressable>
          </View>

          <Pressable onPress={() => router.replace("/setup")} style={styles.changeServer}>
            <Feather name="server" size={13} color={c.mutedForeground} />
            <Text style={[styles.changeServerText, { color: c.mutedForeground }]}>{t.changeServer}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 24 },
  header: { alignItems: "center", gap: 10 },
  logoBox: { width: 72, height: 72, borderRadius: 18, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: 6 },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  card: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 14 },
  formTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 2 },
  fieldWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, height: 48 },
  field: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8 },
  errorText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium" },
  loginBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 12 },
  loginBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  changeServer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  changeServerText: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
