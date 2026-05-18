import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
}

export function OTPInput({ length = 6, value, onChange }: OTPInputProps) {
  const colors = useColors();
  const inputRef = useRef<TextInput>(null);

  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  return (
    <Pressable style={styles.container} onPress={() => inputRef.current?.focus()}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hidden}
        autoFocus
      />
      {digits.map((d, i) => {
        const isActive = i === value.length;
        const filled = i < value.length;
        return (
          <View
            key={i}
            style={[
              styles.box,
              {
                borderColor: isActive
                  ? colors.primary
                  : filled
                  ? colors.accent
                  : colors.border,
                backgroundColor: filled ? colors.primary : colors.card,
                shadowColor: isActive ? colors.primary : "transparent",
                shadowOpacity: isActive ? 0.5 : 0,
                shadowRadius: 8,
                elevation: isActive ? 4 : 0,
              },
            ]}
          >
            <TextInput
              style={[
                styles.digit,
                { color: filled ? colors.primaryForeground : colors.foreground },
              ]}
              value={d}
              editable={false}
              pointerEvents="none"
            />
          </View>
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  hidden: {
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "ios" ? { shadowOffset: { width: 0, height: 0 } } : {}),
  },
  digit: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
});
