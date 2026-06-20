import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "@/context/i18n";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

interface Message { id: string; role: "user" | "assistant"; content: string }

export default function AIScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const BOTTOM = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const TOP = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [messages, setMessages] = useState<Message[]>([{ id: "0", role: "assistant", content: t.aiGreeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const QUICK = [t.aiQ1, t.aiQ2, t.aiQ3, t.aiQ4];

  async function send(text: string) {
    const userMsg = text.trim();
    if (!userMsg || loading) return;
    setInput("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updated: Message[] = [...messages, { id: Date.now().toString(), role: "user", content: userMsg }];
    setMessages(updated);
    setLoading(true);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const res = await api.post<{ response: string }>("/api/v1/ai/chat", {
        message: userMsg,
        history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: res.response ?? "No response" }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: t.aiProRequired }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: TOP + 14, backgroundColor: c.background, borderBottomColor: c.border }]}>
        <View style={[styles.aiIcon, { backgroundColor: c.primary + "18" }]}>
          <Feather name="cpu" size={18} color={c.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: c.foreground }]}>{t.aiTitle}</Text>
          <Text style={[styles.subtitle, { color: c.primary }]}>{t.aiSub}</Text>
        </View>
        <View style={[styles.proBadge, { backgroundColor: c.accent + "22", borderColor: c.accent + "44" }]}>
          <Text style={[styles.proBadgeText, { color: c.accent }]}>PRO+</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={[styles.msgList, { paddingBottom: 12 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            messages.length <= 1 ? (
              <View style={styles.quickWrap}>
                <Text style={[styles.quickTitle, { color: c.mutedForeground }]}>{t.quickSuggestions}</Text>
                {QUICK.map((q) => (
                  <Pressable key={q} style={({ pressed }) => [styles.quickChip, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.7 : 1 }]} onPress={() => send(q)}>
                    <Feather name="zap" size={12} color={c.primary} />
                    <Text style={[styles.quickChipText, { color: c.foreground }]}>{q}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === "user" ? [styles.userBubble, { backgroundColor: c.primary + "22", borderColor: c.primary + "44" }] : [styles.aiBubble, { backgroundColor: c.card, borderColor: c.border }]]}>
              {item.role === "assistant" && <Feather name="cpu" size={13} color={c.primary} style={{ marginBottom: 4 }} />}
              <Text style={[styles.bubbleText, { color: c.foreground }]}>{item.content}</Text>
            </View>
          )}
        />

        {loading && (
          <View style={[styles.typingRow, { paddingHorizontal: 16, paddingBottom: 4 }]}>
            <ActivityIndicator size="small" color={c.primary} />
            <Text style={[styles.typingText, { color: c.mutedForeground }]}>{t.aiTyping}</Text>
          </View>
        )}

        <View style={[styles.inputBar, { backgroundColor: c.card, borderTopColor: c.border, paddingBottom: BOTTOM + 70 }]}>
          <TextInput
            style={[styles.textInput, { color: c.foreground, backgroundColor: c.input, borderColor: c.border }]}
            placeholder={t.aiPlaceholder}
            placeholderTextColor={c.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
          />
          <Pressable
            style={({ pressed }) => [styles.sendBtn, { backgroundColor: input.trim() ? c.primary : c.muted, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => send(input)}
            disabled={!input.trim() || loading}
          >
            <Feather name="send" size={18} color={input.trim() ? c.primaryForeground : c.mutedForeground} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  aiIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 11, fontFamily: "Inter_500Medium" },
  proBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  proBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  msgList: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  quickWrap: { gap: 8, marginBottom: 16 },
  quickTitle: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 4 },
  quickChip: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  quickChipText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  bubble: { borderRadius: 12, borderWidth: 1, padding: 12, maxWidth: "90%" },
  userBubble: { alignSelf: "flex-end" },
  aiBubble: { alignSelf: "flex-start" },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  typingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  typingText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  inputBar: { borderTopWidth: 1, padding: 12, flexDirection: "row", gap: 10, alignItems: "flex-end" },
  textInput: { flex: 1, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular", maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
