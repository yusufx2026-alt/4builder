import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { StarRating } from "@/components/StarRating";
import {
  useGetProvider,
  useGetProviderReviews,
  useCreateReview,
  getGetProviderReviewsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const { width } = Dimensions.get("window");

function typeLabel(type: string): string {
  switch (type) {
    case "contractor": return "Contractor";
    case "craftsman": return "Craftsman";
    case "machinery": return "Heavy Machinery";
    default: return type;
  }
}

export default function ProviderDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  const { data: provider, isLoading } = useGetProvider(id ?? "");
  const { data: reviewData } = useGetProviderReviews(id ?? "");

  const createReview = useCreateReview({
    mutation: {
      onSuccess: () => {
        setShowReviewModal(false);
        setReviewText("");
        setReviewRating(5);
        qc.invalidateQueries({ queryKey: getGetProviderReviewsQueryKey(id ?? "") });
      },
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Provider not found</Text>
      </View>
    );
  }

  const images = provider.portfolioImages ?? [];
  const specs = provider.type === "machinery"
    ? provider.machinerySpecs as Record<string, string> | null
    : provider.type === "craftsman"
    ? provider.craftDetails as Record<string, string> | null
    : provider.contractorDetails as Record<string, string> | null;

  const isPremium = provider.subscriptionPlan === "gold" || provider.subscriptionPlan === "silver";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        {images.length > 0 ? (
          <View>
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))
              }
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={[styles.heroImage, { width }]} resizeMode="cover" />
              )}
            />
            {images.length > 1 && (
              <View style={styles.imageDots}>
                {images.map((_, i) => (
                  <View key={i} style={[styles.imageDot, { backgroundColor: i === imageIndex ? "#fff" : "rgba(255,255,255,0.4)" }]} />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: colors.primary }]}>
            <Feather name="image" size={48} color={colors.primaryForeground} />
          </View>
        )}

        <View style={styles.body}>
          {/* Header */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.nameWithBadge}>
                <Text style={[styles.providerName, { color: colors.foreground }]}>{provider.name}</Text>
                {isPremium && (
                  <View style={[styles.planBadge, { backgroundColor: provider.subscriptionPlan === "gold" ? colors.gold : colors.silver }]}>
                    <Text style={styles.planText}>{(provider.subscriptionPlan ?? "").toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.typeText, { color: colors.mutedForeground }]}>{typeLabel(provider.type)}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <StarRating rating={provider.avgRating ?? 0} size={16} />
            <Text style={[styles.ratingValue, { color: colors.foreground }]}>{(provider.avgRating ?? 0).toFixed(1)}</Text>
            <Text style={[styles.ratingCount, { color: colors.mutedForeground }]}>({provider.totalReviews ?? 0} reviews)</Text>
            <View style={styles.views}>
              <Feather name="eye" size={13} color={colors.mutedForeground} />
              <Text style={[styles.viewsText, { color: colors.mutedForeground }]}>{(provider.totalViews ?? 0) + 1} views</Text>
            </View>
          </View>

          {/* Location */}
          <View style={[styles.infoChip, { backgroundColor: colors.secondary }]}>
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text style={[styles.infoChipText, { color: colors.foreground }]}>
              {provider.neighborhood ? `${provider.neighborhood}, ` : ""}{provider.governorate}
            </Text>
          </View>

          {/* Description */}
          {provider.description && (
            <View style={[styles.section, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>{provider.description}</Text>
            </View>
          )}

          {/* Specialties */}
          {(provider.specialties?.length ?? 0) > 0 && (
            <View style={[styles.section, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Specialties</Text>
              <View style={styles.tagsWrap}>
                {provider.specialties!.map((s, i) => (
                  <View key={i} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Specs */}
          {specs && Object.keys(specs).length > 0 && (
            <View style={[styles.section, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Details</Text>
              {Object.entries(specs).map(([k, v]) => (
                <View key={k} style={styles.specRow}>
                  <Text style={[styles.specKey, { color: colors.mutedForeground }]}>{k}</Text>
                  <Text style={[styles.specVal, { color: colors.foreground }]}>{String(v)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Reviews */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Reviews ({reviewData?.total ?? 0})
              </Text>
              {user && user.role === "client" && (
                <Pressable onPress={() => setShowReviewModal(true)}>
                  <Text style={[styles.writeReview, { color: colors.primary }]}>Write review</Text>
                </Pressable>
              )}
            </View>
            {(reviewData?.reviews ?? []).slice(0, 5).map((r) => (
              <View key={r.id} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewName, { color: colors.foreground }]}>{r.clientName ?? "Anonymous"}</Text>
                  <StarRating rating={r.rating} size={12} />
                </View>
                {r.text && <Text style={[styles.reviewText, { color: colors.mutedForeground }]}>{r.text}</Text>}
              </View>
            ))}
            {(reviewData?.reviews ?? []).length === 0 && (
              <Text style={[styles.noReviews, { color: colors.mutedForeground }]}>No reviews yet. Be the first!</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.navBar, borderTopColor: colors.navBarBorder, paddingBottom: Platform.OS === "web" ? 20 : insets.bottom + 8 }]}>
        <Pressable
          onPress={() => Linking.openURL(`tel:${provider.phone ?? ""}`)}
          style={[styles.callBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="phone" size={20} color={colors.primaryForeground} />
          <Text style={[styles.callBtnText, { color: colors.primaryForeground }]}>Call Now</Text>
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL(`https://wa.me/${(provider.phone ?? "").replace(/\D/g, "")}`)}
          style={[styles.waBtn, { backgroundColor: "#25D366" }]}
        >
          <Feather name="message-circle" size={20} color="#fff" />
          <Text style={[styles.callBtnText, { color: "#fff" }]}>WhatsApp</Text>
        </Pressable>
      </View>

      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowReviewModal(false)}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Write a Review</Text>
            <View style={styles.ratingPicker}>
              {[1, 2, 3, 4, 5].map((r) => (
                <Pressable key={r} onPress={() => setReviewRating(r)} hitSlop={6}>
                  <Feather name="star" size={36} color={r <= reviewRating ? "#C9A227" : colors.border} />
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => createReview.mutate({ providerId: id ?? "", data: { rating: reviewRating, text: reviewText || undefined } })}
              disabled={createReview.isPending}
              style={[styles.submitReview, { backgroundColor: colors.primary }]}
            >
              {createReview.isPending ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.submitReviewText, { color: colors.primaryForeground }]}>Submit Review</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroImage: { height: 280 },
  heroPlaceholder: { height: 220, alignItems: "center", justifyContent: "center" },
  imageDots: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
  imageDot: { width: 6, height: 6, borderRadius: 3 },
  body: { padding: 20, gap: 16 },
  nameRow: { flexDirection: "row", alignItems: "flex-start" },
  nameWithBadge: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  providerName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  planBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  planText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  typeText: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  ratingValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  ratingCount: { fontSize: 13, fontFamily: "Inter_400Regular" },
  views: { flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto" },
  viewsText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  infoChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: "flex-start" },
  infoChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  section: { borderTopWidth: 1, paddingTop: 16, gap: 10 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  specRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  specKey: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  specVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  reviewsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  writeReview: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reviewCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reviewText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  noReviews: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingVertical: 12 },
  bottomBar: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
  callBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  waBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  callBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center" },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  ratingPicker: { flexDirection: "row", justifyContent: "center", gap: 8 },
  submitReview: { height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  submitReviewText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
