import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { ProviderCard } from "@/components/ProviderCard";
import { useListProviders } from "@workspace/api-client-react";

type FilterType = "" | "contractor" | "craftsman" | "machinery";
type SortOption = "top_rated" | "most_experienced" | "available" | "";

const TYPES: { id: FilterType; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { id: "", label: "All", icon: "list" },
  { id: "contractor", label: "Contractors", icon: "home" },
  { id: "craftsman", label: "Craftsmen", icon: "tool" },
  { id: "machinery", label: "Machinery", icon: "truck" },
];

export default function DirectoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ type?: string; governorate?: string }>();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>((params.type ?? "") as FilterType);
  const [sort, setSort] = useState<SortOption>("top_rated");
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useListProviders({
    type: filterType || undefined,
    search: search || undefined,
    sort: sort || undefined,
  });

  const providers = data?.providers ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.navBar, borderBottomColor: colors.navBarBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Directory</Text>

        <View style={[styles.searchBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search contractors, craftsmen..."
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="search"
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setFilterType(t.id)}
              style={[
                styles.typeChip,
                {
                  backgroundColor: filterType === t.id ? colors.primary : colors.secondary,
                  borderColor: filterType === t.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Feather name={t.icon} size={13} color={filterType === t.id ? colors.primaryForeground : colors.foreground} />
              <Text style={[styles.typeChipText, { color: filterType === t.id ? colors.primaryForeground : colors.foreground }]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProviderCard
              {...item}
              specialties={item.specialties ?? []}
              portfolioImages={item.portfolioImages ?? []}
              avgRating={item.avgRating ?? 0}
              totalReviews={item.totalReviews ?? 0}
              totalViews={item.totalViews ?? 0}
              subscriptionPlan={item.subscriptionPlan ?? "none"}
              isActive={item.isActive ?? true}
              onPress={() => router.push({ pathname: "/provider/[id]", params: { id: item.id } })}
            />
          )}
          contentContainerStyle={[
            styles.list,
            {
              paddingBottom: Platform.OS === "web" ? 100 : 100 + insets.bottom,
            },
          ]}
          ListHeaderComponent={
            <View style={styles.sortRow}>
              <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
                {providers.length} results
              </Text>
              <View style={styles.sortBtns}>
                {(["top_rated", "most_experienced"] as SortOption[]).map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setSort(s)}
                    style={[styles.sortBtn, { backgroundColor: sort === s ? colors.primary : colors.secondary }]}
                  >
                    <Text style={[styles.sortBtnText, { color: sort === s ? colors.primaryForeground : colors.mutedForeground }]}>
                      {s === "top_rated" ? "Top Rated" : "Experienced"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="search" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No providers found</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Try adjusting your filters or search term
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          scrollEnabled={providers.length > 0}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, gap: 10 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  typeChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  list: { padding: 16, gap: 0 },
  sortRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  resultCount: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sortBtns: { flexDirection: "row", gap: 6 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  sortBtnText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  empty: { alignItems: "center", padding: 40, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
