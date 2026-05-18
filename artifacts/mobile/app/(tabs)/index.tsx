import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { CategoryCard } from "@/components/CategoryCard";
import { useGetProviderStats, useGetNotifications, getGetNotificationsQueryKey } from "@workspace/api-client-react";
import { GOVERNORATES } from "@/constants/locations";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [governorate, setGovernorate] = useState<string | null>(null);
  const [showGovModal, setShowGovModal] = useState(false);

  const { data: stats } = useGetProviderStats();
  const { data: notifData } = useGetNotifications({ query: { enabled: !!user, queryKey: getGetNotificationsQueryKey() } });

  const unread = notifData?.unreadCount ?? 0;

  const selectedGov = GOVERNORATES.find((g) => g.id === governorate);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.navBar, borderBottomColor: colors.navBarBorder }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => setShowGovModal(true)}
            style={[styles.govSelector, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          >
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text style={[styles.govText, { color: colors.foreground }]}>
              {selectedGov?.name ?? "All Iraq"}
            </Text>
            <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
          </Pressable>

          <Pressable onPress={() => router.push("/notifications" as never)} style={styles.notifBtn} hitSlop={8}>
            <Feather name="bell" size={22} color={colors.foreground} />
            {unread > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
                <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text style={[styles.greetingText, { color: colors.foreground }]}>
            {user?.name ? `Hello, ${user.name.split(" ")[0]}` : "Hello"}
          </Text>
          <Text style={[styles.greetingSubtitle, { color: colors.mutedForeground }]}>
            Find construction services across Iraq
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {stats && (
          <View style={styles.statsRow}>
            {[
              { label: "Contractors", value: stats.totalContractors, icon: "home" as const },
              { label: "Craftsmen", value: stats.totalCraftsmen, icon: "tool" as const },
              { label: "Machinery", value: stats.totalMachinery, icon: "truck" as const },
            ].map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name={s.icon} size={18} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Services</Text>

        <CategoryCard
          icon="home"
          title="Contractors"
          subtitle="Engineering & construction firms"
          count={stats?.totalContractors}
          onPress={() => router.push({ pathname: "/(tabs)/directory", params: { type: "contractor", governorate: governorate ?? "" } })}
        />
        <CategoryCard
          icon="tool"
          title="Craftsmen"
          subtitle="Plumbers, electricians & trades"
          count={stats?.totalCraftsmen}
          onPress={() => router.push({ pathname: "/(tabs)/directory", params: { type: "craftsman", governorate: governorate ?? "" } })}
        />
        <CategoryCard
          icon="truck"
          title="Heavy Machinery"
          subtitle="Excavators, bulldozers & equipment"
          count={stats?.totalMachinery}
          onPress={() => router.push({ pathname: "/(tabs)/directory", params: { type: "machinery", governorate: governorate ?? "" } })}
        />
      </ScrollView>

      <Modal visible={showGovModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowGovModal(false)}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Governorate</Text>
            <FlatList
              data={[{ id: "", name: "All Iraq", nameAr: "العراق كله" }, ...GOVERNORATES]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => { setGovernorate(item.id || null); setShowGovModal(false); }}
                  style={[styles.govItem, { borderBottomColor: colors.border }]}
                >
                  <Text style={[styles.govItemText, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.govItemAr, { color: colors.mutedForeground }]}>{item.nameAr}</Text>
                  {(item.id === (governorate ?? "")) && (
                    <Feather name="check" size={18} color={colors.primary} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  govSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  govText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  notifBtn: { padding: 4, position: "relative" },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },
  greeting: { gap: 2 },
  greetingText: { fontSize: 22, fontFamily: "Inter_700Bold" },
  greetingSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "75%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
  govItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 8,
  },
  govItemText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  govItemAr: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
