import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { StarRating } from "./StarRating";

interface ProviderCardProps {
  id: string;
  name: string;
  type: string;
  governorate: string;
  neighborhood?: string | null;
  avgRating: number;
  totalReviews: number;
  totalViews?: number;
  specialties: string[];
  portfolioImages: string[];
  subscriptionPlan: string;
  isActive: boolean;
  onPress: () => void;
}

function typeLabel(type: string): string {
  switch (type) {
    case "contractor":
      return "Contractor";
    case "craftsman":
      return "Craftsman";
    case "machinery":
      return "Heavy Machinery";
    default:
      return type;
  }
}

function typeIcon(type: string): React.ComponentProps<typeof Feather>["name"] {
  switch (type) {
    case "contractor":
      return "home";
    case "craftsman":
      return "tool";
    case "machinery":
      return "truck";
    default:
      return "briefcase";
  }
}

export function ProviderCard({
  name,
  type,
  governorate,
  neighborhood,
  avgRating,
  totalReviews,
  specialties,
  portfolioImages,
  subscriptionPlan,
  onPress,
}: ProviderCardProps) {
  const colors = useColors();
  const thumbnail = portfolioImages?.[0];
  const isPremium = subscriptionPlan === "gold" || subscriptionPlan === "silver";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isPremium ? colors.gold : colors.border,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.avatarImg} />
          ) : (
            <Feather name={typeIcon(type)} size={22} color={colors.primaryForeground} />
          )}
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
              {name}
            </Text>
            {isPremium && (
              <View style={[styles.planBadge, { backgroundColor: subscriptionPlan === "gold" ? colors.gold : colors.silver }]}>
                <Text style={styles.planText}>{subscriptionPlan === "gold" ? "GOLD" : "SILVER"}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.type, { color: colors.mutedForeground }]}>{typeLabel(type)}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={avgRating} size={12} />
            <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
              {avgRating.toFixed(1)} ({totalReviews})
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.footer}>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text style={[styles.location, { color: colors.mutedForeground }]}>
            {neighborhood ? `${neighborhood}, ` : ""}{governorate}
          </Text>
        </View>
        {specialties.length > 0 && (
          <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.tagText, { color: colors.primary }]} numberOfLines={1}>
              {specialties[0]}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    ...(Platform.OS === "ios"
      ? { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }
      : { elevation: 2 }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  planBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  planText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  type: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    maxWidth: 120,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
