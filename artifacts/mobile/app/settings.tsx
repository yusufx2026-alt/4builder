import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const scheme = useColorScheme();

  const sections = [
    {
      title: "Appearance",
      items: [
        {
          icon: "moon" as const,
          label: "Dark Mode",
          right: (
            <Text style={[styles.schemeBadge, { color: colors.mutedForeground }]}>
              {scheme === "dark" ? "On" : "Off"}
            </Text>
          ),
        },
      ],
    },
    {
      title: "Language",
      items: [
        {
          icon: "globe" as const,
          label: "Language",
          right: <Text style={[styles.valueText, { color: colors.mutedForeground }]}>English</Text>,
        },
      ],
    },
    {
      title: "Legal",
      items: [
        { icon: "file-text" as const, label: "Terms of Service", right: null },
        { icon: "shield" as const, label: "Privacy Policy", right: null },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: "log-out" as const,
          label: "Sign Out",
          right: null,
          danger: true,
          onPress: logout,
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{section.title}</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {section.items.map((item, i) => (
              <React.Fragment key={item.label}>
                <Pressable
                  onPress={"onPress" in item ? item.onPress : undefined}
                  style={({ pressed }) => [styles.item, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: "danger" in item && item.danger ? "rgba(239,68,68,0.1)" : colors.secondary }]}>
                    <Feather
                      name={item.icon}
                      size={17}
                      color={"danger" in item && item.danger ? colors.destructive : colors.primary}
                    />
                  </View>
                  <Text style={[
                    styles.itemLabel,
                    { color: "danger" in item && item.danger ? colors.destructive : colors.foreground },
                  ]}>
                    {item.label}
                  </Text>
                  {item.right}
                  {!item.right && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
                </Pressable>
                {i < section.items.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      ))}

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        4Builder v1.0.0 — Iraq's Construction Directory
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 6 },
  section: { gap: 6, marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase", paddingHorizontal: 4 },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  item: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  iconWrap: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  itemLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  schemeBadge: { fontSize: 13, fontFamily: "Inter_500Medium" },
  valueText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginHorizontal: 14 },
  version: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8 },
});
