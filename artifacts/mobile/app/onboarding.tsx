import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
  Animated,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    image: require("../assets/images/onboard1.png"),
    title: "Find Top Contractors",
    subtitle: "Browse verified construction firms and engineering companies across all of Iraq",
  },
  {
    image: require("../assets/images/onboard2.png"),
    title: "Hire Skilled Craftsmen",
    subtitle: "Connect directly with trusted local tradespeople — plumbers, electricians, and more",
  },
  {
    image: require("../assets/images/onboard3.png"),
    title: "Rent Heavy Machinery",
    subtitle: "Book excavators, bulldozers, and industrial equipment from verified operators",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const { markOnboarded } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const dotWidths = useRef(SLIDES.map(() => new Animated.Value(8))).current;

  const animateDots = (index: number) => {
    dotWidths.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === index ? 28 : 8,
        tension: 80,
        friction: 8,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
      animateDots(index);
    }
  };

  const next = async () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
    } else {
      await markOnboarded();
      router.replace("/(auth)/login");
    }
  };

  const skip = async () => {
    await markOnboarded();
    router.replace("/(auth)/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={[styles.imageWrap, { backgroundColor: "#000000" }]}>
              <Image source={slide.image} style={styles.image} resizeMode="contain" />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.title, { color: colors.foreground }]}>{slide.title}</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 40 : 60 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotWidths[i],
                  backgroundColor: i === activeIndex ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          <Pressable onPress={skip} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Skip</Text>
          </Pressable>

          <Pressable
            onPress={next}
            style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.nextText, { color: colors.primaryForeground }]}>
              {activeIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { alignItems: "center" },
  imageWrap: {
    width: "100%",
    height: 320,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: 260, height: 260 },
  textWrap: { padding: 32, alignItems: "center", gap: 12 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  footer: { paddingHorizontal: 24, gap: 24 },
  dots: { flexDirection: "row", gap: 6, justifyContent: "center" },
  dot: { height: 8, borderRadius: 4 },
  buttons: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  skipBtn: { padding: 12 },
  skipText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  nextBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  nextText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
