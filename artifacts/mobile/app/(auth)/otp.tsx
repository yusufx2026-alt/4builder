import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { OTPInput } from "@/components/OTPInput";
import { useVerifyOtp, useSendOtp } from "@workspace/api-client-react";

export default function OTPScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login } = useAuth();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const resendOtp = useSendOtp({
    mutation: {
      onSuccess: () => {
        setCountdown(120);
        setCanResend(false);
        setOtp("");
        setError("");
      },
    },
  });

  const verifyOtp = useVerifyOtp({
    mutation: {
      onSuccess: async (data) => {
        const user = data.user as {
          id: string;
          phone: string;
          role: string;
          name?: string;
          avatarUrl?: string;
          governorate?: string;
          neighborhood?: string;
          isVerified: boolean;
        };
        await login(data.token, user);
        if (data.isNewUser && user.role !== "provider") {
          router.replace("/(auth)/role");
        } else if (data.isNewUser) {
          router.replace("/(auth)/role");
        } else {
          router.replace("/(tabs)");
        }
      },
      onError: () => {
        setError("Incorrect code. Please try again.");
        setOtp("");
      },
    },
  });

  const handleVerify = useCallback(() => {
    if (otp.length !== 6) return;
    setError("");
    verifyOtp.mutate({ data: { phone: phone ?? "", otp } });
  }, [otp, phone]);

  useEffect(() => {
    if (otp.length === 6) handleVerify();
  }, [otp]);

  const mins = String(Math.floor(countdown / 60)).padStart(2, "0");
  const secs = String(countdown % 60).padStart(2, "0");

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
      <View style={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
          <Text style={[styles.backText, { color: colors.mutedForeground }]}>← Back</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.foreground }]}>Verify your number</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Enter the 6-digit code sent to{"\n"}
          <Text style={[styles.phone, { color: colors.foreground }]}>{phone}</Text>
        </Text>

        <View style={styles.otpWrap}>
          <OTPInput value={otp} onChange={setOtp} />
        </View>

        {!!error && (
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
        )}

        {verifyOtp.isPending && (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
        )}

        <View style={styles.resendRow}>
          {canResend ? (
            <Pressable
              onPress={() => resendOtp.mutate({ data: { phone: phone ?? "" } })}
              disabled={resendOtp.isPending}
            >
              <Text style={[styles.resendText, { color: colors.primary }]}>
                {resendOtp.isPending ? "Sending..." : "Resend Code"}
              </Text>
            </Pressable>
          ) : (
            <Text style={[styles.countdown, { color: colors.mutedForeground }]}>
              Resend code in {mins}:{secs}
            </Text>
          )}
        </View>
      </View>

      {Platform.OS === "web" && (
        <View style={{ height: 34 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  content: { flex: 1, gap: 16 },
  back: { marginBottom: 8 },
  backText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  phone: { fontFamily: "Inter_600SemiBold" },
  otpWrap: { marginVertical: 16 },
  error: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  resendRow: { alignItems: "center", marginTop: 8 },
  resendText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  countdown: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
