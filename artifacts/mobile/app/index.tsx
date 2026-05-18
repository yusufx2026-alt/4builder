import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const colors = useColors();
  const { token, hasOnboarded, isLoading } = useAuth();

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(taglineAnim, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();

    if (Platform.OS !== "web") {
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 12000, useNativeDriver: true })
      ).start();
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (token) {
        router.replace("/(tabs)");
      } else if (hasOnboarded) {
        router.replace("/(auth)/login");
      } else {
        router.replace("/onboarding");
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [isLoading, token, hasOnboarded]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { backgroundColor: "#000000" }]}>
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }, { rotate }],
          },
        ]}
      >
        <Image
          source={require("../assets/images/splash.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.textWrap, { opacity: taglineAnim }]}>
        <Text style={styles.brand}>4Builder</Text>
        <Text style={styles.tagline}>Iraq's Construction Directory</Text>
      </Animated.View>

      <Animated.View style={[styles.dotsWrap, { opacity: taglineAnim }]}>
        <View style={[styles.dot, { backgroundColor: "#1A2332", transform: [{ scale: 1.4 }] }]} />
        <View style={[styles.dot, { backgroundColor: "#2D3F57" }]} />
        <View style={[styles.dot, { backgroundColor: "#2D3F57" }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  logoWrap: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  logo: {
    width: 160,
    height: 160,
  },
  textWrap: {
    alignItems: "center",
    gap: 6,
  },
  brand: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#8899AA",
    letterSpacing: 0.5,
  },
  dotsWrap: {
    flexDirection: "row",
    gap: 8,
    position: "absolute",
    bottom: Platform.OS === "web" ? 50 : 80,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
