import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ThemePreference, useTheme } from "../providers/ThemeProvider";
import { FONT, RADIUS, SPACING } from "../theme";

type Icon = "phone-portrait-outline" | "sunny-outline" | "moon-outline";
const THEME_OPTIONS: { label: string; value: ThemePreference; icon: Icon }[] = [
  { label: "System", value: "system", icon: "phone-portrait-outline" },
  { label: "Light", value: "light", icon: "sunny-outline" },
  { label: "Dark", value: "dark", icon: "moon-outline" },
];

export const Settings = () => {
  const { colors, preference, setPreference } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.lg }}
    >
      <View
        style={{
          borderRadius: RADIUS.md,
          overflow: "hidden",
          backgroundColor: colors.dark,
        }}
      >
        <Text
          style={{
            fontSize: FONT.base,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            color: colors.text,
          }}
        >
          Appearance
        </Text>
        {THEME_OPTIONS.map((opt) => {
          const selected = preference === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.md,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.container,
              }}
              onPress={() => setPreference(opt.value)}
            >
              <Ionicons
                name={opt.icon}
                size={22}
                color={selected ? colors.primary : colors.textDisabled}
                style={{ marginRight: SPACING.sm }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: FONT.base,
                  color: selected ? colors.primary : colors.text,
                  fontWeight: selected ? "700" : "400",
                }}
              >
                {opt.label}
              </Text>
              {selected && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};
