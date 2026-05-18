import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useCreateProvider } from "@workspace/api-client-react";
import { GOVERNORATES } from "@/constants/locations";

type Role = "client" | "provider";
type ProviderType = "contractor" | "craftsman" | "machinery";

export default function RoleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [providerType, setProviderType] = useState<ProviderType>("contractor");
  const [name, setName] = useState(user?.name ?? "");
  const [govIdx, setGovIdx] = useState(0);
  const [specialty, setSpecialty] = useState("");

  const createProvider = useCreateProvider({
    mutation: {
      onSuccess: () => {
        router.replace("/(tabs)");
      },
    },
  });

  const handleContinue = async () => {
    if (role === "client") {
      router.replace("/(tabs)");
      return;
    }
    if (!name.trim()) return;
    createProvider.mutate({
      data: {
        type: providerType,
        name: name.trim(),
        phone: user?.phone ?? "",
        governorate: GOVERNORATES[govIdx]?.id ?? "baghdad",
        specialties: specialty.trim() ? [specialty.trim()] : [],
      },
    });
  };

  const providerTypes: { id: ProviderType; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
    { id: "contractor", label: "Contractor", icon: "home" },
    { id: "craftsman", label: "Craftsman", icon: "tool" },
    { id: "machinery", label: "Heavy Machinery", icon: "truck" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.foreground }]}>How will you use{"\n"}4Builder?</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Choose your account type</Text>

      <View style={styles.cards}>
        {(["client", "provider"] as Role[]).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRole(r)}
            style={[
              styles.roleCard,
              {
                backgroundColor: role === r ? colors.primary : colors.card,
                borderColor: role === r ? colors.primary : colors.border,
              },
            ]}
          >
            <Feather
              name={r === "client" ? "search" : "briefcase"}
              size={28}
              color={role === r ? colors.primaryForeground : colors.foreground}
            />
            <Text style={[styles.roleName, { color: role === r ? colors.primaryForeground : colors.foreground }]}>
              {r === "client" ? "I'm looking\nfor services" : "I provide\nservices"}
            </Text>
            <Text style={[styles.roleDesc, { color: role === r ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>
              {r === "client" ? "Browse contractors, craftsmen & machinery" : "List your business in the directory"}
            </Text>
          </Pressable>
        ))}
      </View>

      {role === "provider" && (
        <View style={styles.providerForm}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Provider Type</Text>
          <View style={styles.typeRow}>
            {providerTypes.map((pt) => (
              <Pressable
                key={pt.id}
                onPress={() => setProviderType(pt.id)}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor: providerType === pt.id ? colors.primary : colors.secondary,
                    flex: 1,
                  },
                ]}
              >
                <Feather name={pt.icon} size={18} color={providerType === pt.id ? colors.primaryForeground : colors.foreground} />
                <Text style={[styles.typeBtnText, { color: providerType === pt.id ? colors.primaryForeground : colors.foreground }]}>
                  {pt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Business Name</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name or business name"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Governorate</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.govScroll}>
            {GOVERNORATES.map((g, i) => (
              <Pressable
                key={g.id}
                onPress={() => setGovIdx(i)}
                style={[
                  styles.govChip,
                  {
                    backgroundColor: govIdx === i ? colors.primary : colors.secondary,
                    borderColor: govIdx === i ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.govChipText, { color: govIdx === i ? colors.primaryForeground : colors.foreground }]}>
                  {g.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Specialty (optional)</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="e.g. Residential Construction, Plumbing..."
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
      )}

      {role && (
        <Pressable
          onPress={handleContinue}
          disabled={createProvider.isPending || (role === "provider" && !name.trim())}
          style={[
            styles.continueBtn,
            {
              backgroundColor: (role === "client" || name.trim()) ? colors.primary : colors.muted,
              opacity: createProvider.isPending ? 0.7 : 1,
            },
          ]}
        >
          {createProvider.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.continueBtnText, { color: colors.primaryForeground }]}>Continue</Text>
          )}
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", lineHeight: 34 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular" },
  cards: { flexDirection: "row", gap: 12 },
  roleCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    gap: 8,
    alignItems: "flex-start",
  },
  roleName: { fontSize: 15, fontFamily: "Inter_700Bold", lineHeight: 20 },
  roleDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
  providerForm: { gap: 10 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: { borderRadius: 10, padding: 10, alignItems: "center", gap: 4 },
  typeBtnText: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  govScroll: { flexGrow: 0 },
  govChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  govChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  continueBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  continueBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
