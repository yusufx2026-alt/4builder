import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import {
  useGetSubscriptionPlans,
  useGetSubscriptionStatus,
  useActivateSubscription,
  getGetSubscriptionStatusQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

type PlanId = "silver" | "gold";
type PaymentMethod = "fib" | "zain_cash" | "fastpay";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; color: string }[] = [
  { id: "fib", label: "FIB", color: "#007B3B" },
  { id: "zain_cash", label: "ZainCash", color: "#EE2737" },
  { id: "fastpay", label: "FastPay", color: "#0055A5" },
];

export default function SubscriptionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

  const { data: plansData } = useGetSubscriptionPlans();
  const { data: status } = useGetSubscriptionStatus();

  const activate = useActivateSubscription({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSubscriptionStatusQueryKey() });
        setSelectedPlan(null);
        setSelectedPayment(null);
        Alert.alert("Success", "Your subscription is now active!");
      },
    },
  });

  const plans = plansData?.plans ?? [];
  const currentPlan = status?.plan;
  const isActive = status?.status === "active";

  const handleActivate = () => {
    if (!selectedPlan || !selectedPayment) return;
    activate.mutate({
      data: {
        plan: selectedPlan,
        paymentMethod: selectedPayment,
        transactionId: `TEST-${Date.now()}`,
      },
    });
  };

  const expiresDate = isActive && status?.expiresAt
    ? new Date(status.expiresAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Boost your visibility in Iraq's construction directory
      </Text>

      {isActive && currentPlan && currentPlan !== "none" && (
        <View style={[styles.currentPlan, { backgroundColor: colors.primary }]}>
          <Feather name="check-circle" size={20} color="#C9A227" />
          <View>
            <Text style={styles.currentPlanTitle}>Active: {currentPlan.toUpperCase()} Plan</Text>
            {expiresDate && (
              <Text style={styles.currentPlanExp}>Expires {expiresDate}</Text>
            )}
          </View>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose a Plan</Text>

      {plans.map((plan) => {
        const planId = plan.id as PlanId;
        const isSelected = selectedPlan === planId;
        const isCurrent = isActive && currentPlan === planId;
        const isGold = planId === "gold";

        return (
          <Pressable
            key={planId}
            onPress={() => setSelectedPlan(planId)}
            style={[
              styles.planCard,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: isGold ? colors.gold : isSelected ? colors.primary : colors.border,
                borderWidth: isSelected || isGold ? 2 : 1,
              },
            ]}
          >
            {isGold && (
              <View style={[styles.popularBadge, { backgroundColor: colors.gold }]}>
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <View style={[styles.planIcon, { backgroundColor: isGold ? colors.gold : colors.silver }]}>
                <Feather name="award" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.planName, { color: isSelected ? "#fff" : colors.foreground }]}>
                  {plan.name}
                </Text>
                <Text style={[styles.planPrice, { color: isSelected ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]}>
                  {plan.priceMonthly?.toLocaleString()} IQD / month
                </Text>
              </View>
              {isCurrent && (
                <View style={[styles.currentBadge, { backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : colors.secondary }]}>
                  <Text style={{ color: isSelected ? "#fff" : colors.primary, fontSize: 10, fontFamily: "Inter_600SemiBold" }}>ACTIVE</Text>
                </View>
              )}
              {isSelected && !isCurrent && (
                <Feather name="check-circle" size={22} color="#C9A227" />
              )}
            </View>
            <View style={styles.featuresList}>
              {(plan.features ?? []).map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Feather name="check" size={14} color={isSelected ? "rgba(255,255,255,0.8)" : colors.primary} />
                  <Text style={[styles.featureText, { color: isSelected ? "rgba(255,255,255,0.85)" : colors.mutedForeground }]}>
                    {f}
                  </Text>
                </View>
              ))}
            </View>
          </Pressable>
        );
      })}

      {selectedPlan && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment Method</Text>
          <View style={styles.paymentRow}>
            {PAYMENT_METHODS.map((pm) => (
              <Pressable
                key={pm.id}
                onPress={() => setSelectedPayment(pm.id)}
                style={[
                  styles.paymentBtn,
                  {
                    borderColor: selectedPayment === pm.id ? pm.color : colors.border,
                    backgroundColor: selectedPayment === pm.id ? pm.color : colors.card,
                    borderWidth: selectedPayment === pm.id ? 2 : 1,
                  },
                ]}
              >
                <Text style={[styles.paymentLabel, { color: selectedPayment === pm.id ? "#fff" : colors.foreground }]}>
                  {pm.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleActivate}
            disabled={!selectedPayment || activate.isPending}
            style={[
              styles.activateBtn,
              {
                backgroundColor: selectedPayment ? colors.primary : colors.muted,
                opacity: activate.isPending ? 0.7 : 1,
              },
            ]}
          >
            {activate.isPending ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <>
                <Feather name="zap" size={18} color={selectedPayment ? colors.primaryForeground : colors.mutedForeground} />
                <Text style={[styles.activateBtnText, { color: selectedPayment ? colors.primaryForeground : colors.mutedForeground }]}>
                  Activate {selectedPlan ? selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) : ""} Plan
                </Text>
              </>
            )}
          </Pressable>
        </>
      )}

      <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
        Subscriptions renew monthly. Cancel anytime by contacting support.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 14 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  currentPlan: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: 14 },
  currentPlanTitle: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  currentPlanExp: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  planCard: { borderRadius: 16, padding: 18, gap: 14, overflow: "hidden" },
  popularBadge: { position: "absolute", top: 14, right: 14, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  popularText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  planIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  planName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  planPrice: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  featuresList: { gap: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  paymentRow: { flexDirection: "row", gap: 10 },
  paymentBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  paymentLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  activateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, borderRadius: 14 },
  activateBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16 },
});
