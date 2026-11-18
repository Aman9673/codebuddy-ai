import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";

export function AppScreen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function AppHeader({
  eyebrow,
  title,
  caption,
}: {
  eyebrow: string;
  title: string;
  caption: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Text style={styles.brandPanda}>🐼</Text>
        <Text style={styles.brandName}>
          Code<Text style={styles.brandAccent}>Buddy</Text>
        </Text>
      </View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ActionButton({
  children,
  secondary = false,
  ...props
}: PressableProps & { children: ReactNode; secondary?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={(state) => [
        styles.button,
        secondary && styles.secondaryButton,
        state.pressed && styles.buttonPressed,
        typeof props.style === "function" ? props.style(state) : props.style,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

export const textStyles = StyleSheet.create({
  body: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: "800" },
  smallLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36, gap: 18 },
  header: { gap: 8, paddingTop: 4, paddingBottom: 4 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 9 },
  brandPanda: { fontSize: 25 },
  brandName: { color: colors.text, fontSize: 17, fontWeight: "900" },
  brandAccent: { color: colors.purple },
  eyebrow: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: { color: colors.text, fontSize: 27, fontWeight: "900", letterSpacing: -0.5 },
  caption: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 17,
    backgroundColor: colors.surface,
    gap: 12,
  },
  button: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 17,
    borderRadius: 13,
    backgroundColor: colors.purpleDark,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  notice: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#7856d8",
    backgroundColor: "#1d1b3c",
    padding: 12,
  },
  noticeText: { color: "#e5dcff", fontSize: 12, lineHeight: 18 },
});
