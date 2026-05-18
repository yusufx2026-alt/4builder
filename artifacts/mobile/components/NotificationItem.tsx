import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface NotificationItemProps {
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  onPress?: () => void;
  onDismiss?: () => void;
}

function getIcon(type: string): React.ComponentProps<typeof Feather>["name"] {
  switch (type) {
    case "payment":
      return "credit-card";
    case "review":
      return "star";
    case "subscription":
      return "award";
    default:
      return "bell";
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationItem({
  type,
  title,
  message,
  isRead,
  createdAt,
  onPress,
  onDismiss,
}: NotificationItemProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: isRead ? colors.card : colors.secondary,
          borderColor: colors.border,
          borderLeftColor: isRead ? colors.border : colors.primary,
          borderLeftWidth: isRead ? 1 : 3,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
        <Feather name={getIcon(type)} size={18} color={colors.primaryForeground} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.mutedForeground }]} numberOfLines={2}>
          {message}
        </Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>{timeAgo(createdAt)}</Text>
      </View>
      {onDismiss && (
        <Pressable onPress={onDismiss} style={styles.dismiss} hitSlop={10}>
          <Feather name="x" size={16} color={colors.mutedForeground} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  message: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  dismiss: {
    padding: 4,
  },
});
