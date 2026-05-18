import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { NotificationItem } from "@/components/NotificationItem";
import {
  useGetNotifications,
  useMarkNotificationRead,
  useDismissNotification,
  getGetNotificationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useGetNotifications({
    query: { enabled: !!user, queryKey: getGetNotificationsQueryKey() },
  });

  const markRead = useMarkNotificationRead({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetNotificationsQueryKey() }) },
  });

  const dismiss = useDismissNotification({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetNotificationsQueryKey() }) },
  });

  const notifications = data?.notifications ?? [];
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad + 20 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, paddingHorizontal: 20 }]}>Alerts</Text>
        <View style={styles.empty}>
          <Feather name="lock" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sign in to view alerts</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.navBar, borderBottomColor: colors.navBarBorder }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Alerts</Text>
          {(data?.unreadCount ?? 0) > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.destructive }]}>
              <Text style={styles.unreadText}>{data?.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              type={item.type}
              title={item.title}
              message={item.message}
              isRead={item.isRead}
              createdAt={typeof item.createdAt === "string" ? item.createdAt : new Date(item.createdAt).toISOString()}
              onPress={() => {
                if (!item.isRead) markRead.mutate({ notificationId: item.id });
              }}
              onDismiss={() => dismiss.mutate({ notificationId: item.id })}
            />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom },
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="bell" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All caught up</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No notifications yet
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  unreadBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  unreadText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  list: { padding: 16 },
  empty: { alignItems: "center", padding: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
