import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ToolCard } from "@/components/ToolCard";
import { useI18n } from "@/context/i18n";
import { useColors } from "@/hooks/useColors";

interface Tool {
  id: string;
  nameKey: string;
  descKey: string;
  category: string;
  tier: string;
}

const TOOLS_DATA = [
  { id: "1", nameKey: "WAF Scanner", descKey: "Scan firewall rules and analyze blocked requests", category: "security", tier: "basic" },
  { id: "2", nameKey: "Port Scanner", descKey: "Scan open ports and services on the local network", category: "network", tier: "basic" },
  { id: "3", nameKey: "Auth Audit", descKey: "Review authentication logs and analyze login attempts", category: "auth", tier: "basic" },
  { id: "4", nameKey: "SQL Injection Tester", descKey: "Test SQL injection vulnerabilities in data forms", category: "security", tier: "pro" },
  { id: "5", nameKey: "XSS Detector", descKey: "Detect Cross-Site Scripting vulnerabilities", category: "security", tier: "pro" },
  { id: "6", nameKey: "JWT Analyzer", descKey: "Analyze and verify JWT token integrity", category: "auth", tier: "pro" },
  { id: "7", nameKey: "AI Threat Intelligence", descKey: "Analyze threats using artificial intelligence", category: "ai", tier: "pro" },
  { id: "8", nameKey: "SIEM Dashboard", descKey: "Security Information and Event Management center", category: "monitoring", tier: "pro" },
  { id: "9", nameKey: "Vulnerability Scanner", descKey: "Comprehensive security vulnerability scan", category: "security", tier: "enterprise" },
  { id: "10", nameKey: "Network Sniffer", descKey: "Analyze network packets and detect suspicious patterns", category: "network", tier: "enterprise" },
  { id: "11", nameKey: "Audit Chain Viewer", descKey: "View encrypted audit chain and event logs", category: "audit", tier: "basic" },
  { id: "12", nameKey: "Backup & Recovery", descKey: "Backup and restore security configurations", category: "database", tier: "enterprise" },
];

const CATEGORIES = ["all", "security", "network", "auth", "ai", "monitoring", "audit", "database"];

export default function ToolsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");

  const TOP = insets.top + (Platform.OS === "web" ? 67 : 0);
  const BOTTOM = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 70;

  const filtered = TOOLS_DATA.filter((tool) => {
    const matchCat = cat === "all" || tool.category === cat;
    const matchSearch = !search || tool.nameKey.toLowerCase().includes(search.toLowerCase()) || tool.descKey.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const catLabel = (c: string) => c === "all" ? t.all : c;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: TOP + 14, backgroundColor: c.background, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.foreground }]}>{t.toolsTitle}</Text>
        <Text style={[styles.count, { color: c.mutedForeground }]}>{TOOLS_DATA.length} {t.toolCount}</Text>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: c.input, borderColor: c.border }]}>
        <Feather name="search" size={15} color={c.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: c.foreground }]}
          placeholder={t.searchTool}
          placeholderTextColor={c.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search ? <Feather name="x" size={15} color={c.mutedForeground} onPress={() => setSearch("")} /> : null}
      </View>

      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        keyExtractor={(i) => i}
        renderItem={({ item }) => {
          const active = item === cat;
          return (
            <View style={[styles.catChip, { backgroundColor: active ? c.primary : c.card, borderColor: active ? c.primary : c.border }]}>
              <Text style={[styles.catText, { color: active ? c.primaryForeground : c.mutedForeground }]} onPress={() => setCat(item)}>
                {catLabel(item)}
              </Text>
            </View>
          );
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={[styles.list, { paddingBottom: BOTTOM }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={32} color={c.mutedForeground} />
            <Text style={[styles.emptyText, { color: c.mutedForeground }]}>{t.noResults}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ToolCard
            name={item.nameKey}
            description={item.descKey}
            category={item.category}
            tier={item.tier}
            onPress={() =>
              router.push({
                pathname: "/tool/[name]",
                params: { name: item.id, title: item.nameKey, desc: item.descKey, tier: item.tier },
              })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  count: { fontSize: 13, fontFamily: "Inter_400Regular" },
  searchWrap: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 12, marginBottom: 4, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, height: 42, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  catList: { paddingHorizontal: 16, gap: 8, paddingVertical: 10 },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  catText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { alignItems: "center", gap: 10, marginTop: 60 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
