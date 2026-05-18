import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useGetSubscriptionStatus, getGetSubscriptionStatusQueryKey } from "@workspace/api-client-react";

interface MenuItem {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const { data: sub } = useGetSubscriptionStatus({ query: { enabled: !!user, queryKey: getGetSubscriptionStatusQueryKey() } });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad + 20 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, paddingHorizontal: 20 }]}>Profile</Text>
        <View style={styles.signInPrompt}>
          <Feather name="user" size={48} color={colors.mutedForeground} />
          <Text style={[styles.signInTitle, { color: colors.foreground }]}>Sign in to access your profile</Text>
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={[styles.signInBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.signInBtnText, { color: colors.primaryForeground }]}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const initials = (user.name ?? user.phone)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const subPlan = sub?.plan;
  const isActiveSub = sub?.status === "active";

  const menuItems: MenuItem[] = [
    { icon: "edit-2", label: "Edit Profile", onPress: () => router.push("/edit-profile") },
    { icon: "award", label: "Subscription", onPress: () => router.push("/subscription") },
    { icon: "settings", label: "Settings", onPress: () => router.push("/settings") },
    { icon: "help-circle", label: "Help & Support", onPress: () => {} },
    { icon: "log-out", label: "Sign Out", onPress: logout, danger: true },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.navBar, borderBottomColor: colors.navBarBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>
              {user.name ?? "No name set"}
            </Text>
            <Text style={[styles.profilePhone, { color: colors.mutedForeground }]}>{user.phone}</Text>
            <View style={styles.roleRow}>
              <View style={[styles.roleBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.roleText, { color: colors.primary }]}>
                  {user.role === "provider" ? "Service Provider" : "Client"}
                </Text>
              </View>
              {isActiveSub && subPlan && (
                <View style={[styles.planBadge, { backgroundColor: subPlan === "gold" ? colors.gold : colors.silver }]}>
                  <Text style={styles.planBadgeText}>{subPlan.toUpperCase()}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {!isActiveSub && user.role === "provider" && (
          <Pressable
            onPress={() => router.push("/subscription")}
            style={[styles.upgradeBanner, { backgroundColor: colors.primary }]}
          >
            <Feather name="award" size={20} color="#C9A227" />
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeTitle}>Upgrade your listing</Text>
              <Text style={styles.upgradeSubtitle}>Get Gold or Silver to appear higher in search results</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#fff" />
          </Pressable>
        )}

        {user.governorate && (
          <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.foreground }]}>
              {user.neighborhood ? `${user.neighborhood}, ` : ""}{user.governorate}
            </Text>
          </View>
        )}

        <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {menuItems.map((item, i) => (
            <React.Fragment key={item.label}>
              <Pressable
                onPress={item.onPress}
                style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.7 : 1 }]}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: item.danger ? "rgba(239,68,68,0.1)" : colors.secondary }]}>
                  <Feather
                    name={item.icon}
                    size={18}
                    color={item.danger ? colors.destructive : colors.primary}
                  />
                </View>
                <Text style={[styles.menuLabel, { color: item.danger ? colors.destructive : colors.foreground }]}>
                  {item.label}
                </Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>
              {i < menuItems.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>4Builder v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  signInPrompt: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 40 },
  signInTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  signInBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  signInBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 12 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatar: { width: 60, height: 60, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontFamily: "Inter_700Bold" },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  profilePhone: { fontSize: 13, fontFamily: "Inter_400Regular" },
  roleRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  roleText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  planBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  planBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  upgradeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
  },
  upgradeTitle: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  upgradeSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  locationText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  menu: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  divider: { height: 1, marginHorizontal: 14 },
  version: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8 },
});
