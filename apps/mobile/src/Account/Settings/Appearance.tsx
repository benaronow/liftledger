import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "../../paper";
import {
  ThemePreference,
  useThemePreference,
} from "../../providers/ThemeProvider";
import { RADIUS, SPACING, FONT } from "../../theme";

type Icon = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
const THEME_OPTIONS: { label: string; value: ThemePreference; icon: Icon }[] = [
  { label: "System", value: "system", icon: "cellphone" },
  { label: "Light", value: "light", icon: "weather-sunny" },
  { label: "Dark", value: "dark", icon: "weather-night" },
];

export const Appearance = () => {
  const { colors } = useTheme();
  const { preference, setPreference } = useThemePreference();

  return (
    <Surface
      elevation={1}
      style={{
        width: "100%",
        borderRadius: RADIUS.md,
        gap: SPACING.md,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: colors.dark,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: FONT.base,
          fontWeight: "800",
          alignSelf: "flex-start",
          paddingBottom: SPACING.sm,
        }}
      >
        Appearance
      </Text>
      {THEME_OPTIONS.map((opt, index) => {
        const selected = preference === opt.value;
        return (
          <Pressable
            key={opt.value}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingBottom:
                index === THEME_OPTIONS.length - 1 ? 0 : SPACING.md,
              borderBottomWidth:
                index === THEME_OPTIONS.length - 1
                  ? 0
                  : StyleSheet.hairlineWidth,
              borderBottomColor: colors.container,
            }}
            onPress={() => setPreference(opt.value)}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <MaterialCommunityIcons
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
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={colors.primary}
                />
              )}
            </View>
          </Pressable>
        );
      })}
    </Surface>
  );
};
