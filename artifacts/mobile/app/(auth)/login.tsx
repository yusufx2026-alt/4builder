import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useSendOtp } from "@workspace/api-client-react";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const sendOtp = useSendOtp({
    mutation: {
      onSuccess: () => {
        router.push({ pathname: "/(auth)/otp", params: { phone: `+964${phone}` } });
      },
      onError: (e: { response?: { data?: { error?: string } } }) => {
        setError(e?.response?.data?.error ?? "Failed to send OTP. Try again.");
      },
    },
  });

  const handleSend = () => {
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Enter a valid 10-digit Iraqi mobile number");
      return;
    }
    sendOtp.mutate({ data: { phone: `+964${digits}` } });
  };

  const formatted = phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.foreground }]}>4Builder</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Enter your Iraqi mobile number to continue
          </Text>
        </View>

        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: error ? colors.destructive : colors.border }]}>
          <View style={[styles.prefix, { borderRightColor: colors.border }]}>
            <Text style={[styles.prefixText, { color: colors.foreground }]}>+964</Text>
          </View>
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            value={phone}
            onChangeText={(t) => {
              setError("");
              setPhone(t.replace(/\D/g, "").slice(0, 10));
            }}
            placeholder="7700 000 000"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            maxLength={10}
            autoFocus
          />
        </View>

        {!!error && (
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
        )}

        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Works with AsiaCell, Zain Iraq, and Korek
        </Text>

        <Pressable
          onPress={handleSend}
          disabled={sendOtp.isPending || phone.length < 10}
          style={[
            styles.btn,
            {
              backgroundColor: phone.length >= 10 ? colors.primary : colors.muted,
              opacity: sendOtp.isPending ? 0.7 : 1,
            },
          ]}
        >
          {sendOtp.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.btnText, { color: phone.length >= 10 ? colors.primaryForeground : colors.mutedForeground }]}>
              Send Verification Code
            </Text>
          )}
        </Pressable>

        <Text style={[styles.terms, { color: colors.mutedForeground }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 16 },
  header: { gap: 8, marginBottom: 16 },
  logo: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  inputWrap: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
    height: 56,
  },
  prefix: {
    paddingHorizontal: 14,
    borderRightWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  prefixText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  input: { flex: 1, fontSize: 18, fontFamily: "Inter_500Medium", paddingHorizontal: 14 },
  error: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8 },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -8 },
  btn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  terms: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16 },
});
