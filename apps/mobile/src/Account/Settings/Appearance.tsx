import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "../../paper";
import { SectionCard } from "../../components/SectionCard";
import {
  ThemePreference,
  useThemePreference,
} from "../../providers/ThemeProvider";
import { SPACING, FONT } from "../../theme";

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
    <SectionCard title="Appearance">
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
              borderBottomColor: colors.dark,
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
    </SectionCard>
  );
};
