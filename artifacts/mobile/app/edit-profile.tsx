import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useUpdateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { GOVERNORATES, getNeighborhoodsByGovernorate } from "@/constants/locations";

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();

  const [name, setName] = useState(user?.name ?? "");
  const [governorate, setGovernorate] = useState(user?.governorate ?? "");
  const [neighborhood, setNeighborhood] = useState(user?.neighborhood ?? "");
  const [showGovModal, setShowGovModal] = useState(false);
  const [showHoodModal, setShowHoodModal] = useState(false);

  const neighborhoods = governorate ? getNeighborhoodsByGovernorate(governorate) : [];
  const selectedGov = GOVERNORATES.find((g) => g.id === governorate);

  const updateProfile = useUpdateProfile({
    mutation: {
      onSuccess: (data) => {
        updateUser({
          name: data.name ?? undefined,
          governorate: data.governorate ?? undefined,
          neighborhood: data.neighborhood ?? undefined,
        });
        qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
        Alert.alert("Saved", "Your profile has been updated.");
        router.back();
      },
    },
  });

  const handleSave = () => {
    updateProfile.mutate({
      data: {
        name: name || undefined,
        governorate: governorate || undefined,
        neighborhood: neighborhood || undefined,
      },
    });
  };

  const initials = (user?.name ?? user?.phone ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 40 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>{initials}</Text>
        </View>
        <Text style={[styles.avatarHint, { color: colors.mutedForeground }]}>
          {user?.phone}
        </Text>
      </View>

      <Text style={[styles.label, { color: colors.mutedForeground }]}>Full Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
        value={name}
        onChangeText={setName}
        placeholder="Enter your full name"
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="done"
      />

      <Text style={[styles.label, { color: colors.mutedForeground }]}>Governorate</Text>
      <Pressable
        onPress={() => setShowGovModal(true)}
        style={[styles.pickerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={[styles.pickerText, { color: governorate ? colors.foreground : colors.mutedForeground }]}>
          {selectedGov?.name ?? "Select governorate"}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
      </Pressable>

      {governorate && neighborhoods.length > 0 && (
        <>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Neighborhood</Text>
          <Pressable
            onPress={() => setShowHoodModal(true)}
            style={[styles.pickerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.pickerText, { color: neighborhood ? colors.foreground : colors.mutedForeground }]}>
              {neighborhoods.find((n) => n.id === neighborhood)?.name ?? "Select neighborhood"}
            </Text>
            <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
          </Pressable>
        </>
      )}

      <Pressable
        onPress={handleSave}
        disabled={updateProfile.isPending}
        style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: updateProfile.isPending ? 0.7 : 1 }]}
      >
        {updateProfile.isPending ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save Changes</Text>
        )}
      </Pressable>

      {/* Governorate Modal */}
      <Modal visible={showGovModal} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowGovModal(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Select Governorate</Text>
            <FlatList
              data={GOVERNORATES}
              keyExtractor={(g) => g.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => { setGovernorate(item.id); setNeighborhood(""); setShowGovModal(false); }}
                  style={[styles.listItem, { borderBottomColor: colors.border }]}
                >
                  <Text style={[styles.listItemText, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.listItemAr, { color: colors.mutedForeground }]}>{item.nameAr}</Text>
                  {item.id === governorate && <Feather name="check" size={16} color={colors.primary} />}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      {/* Neighborhood Modal */}
      <Modal visible={showHoodModal} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowHoodModal(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Select Neighborhood</Text>
            <FlatList
              data={neighborhoods}
              keyExtractor={(n) => n.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => { setNeighborhood(item.id); setShowHoodModal(false); }}
                  style={[styles.listItem, { borderBottomColor: colors.border }]}
                >
                  <Text style={[styles.listItemText, { color: colors.foreground }]}>{item.name}</Text>
                  {item.id === neighborhood && <Feather name="check" size={16} color={colors.primary} />}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 10 },
  avatarSection: { alignItems: "center", gap: 8, marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold" },
  avatarHint: { fontSize: 13, fontFamily: "Inter_400Regular" },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3, textTransform: "uppercase" },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
  },
  pickerBtn: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  pickerText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  saveBtn: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 12 },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "75%" },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, gap: 8 },
  listItemText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  listItemAr: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
