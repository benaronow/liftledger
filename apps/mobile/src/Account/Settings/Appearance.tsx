import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SectionCard } from "../../components/SectionCard";
import {
  ThemePreference,
  useThemePreference,
} from "../../providers/ThemeProvider";
import { SPACING, FONT, RADIUS } from "../../theme";

type Icon = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
const THEME_OPTIONS: { label: string; value: ThemePreference; icon: Icon }[] = [
  { label: "System", value: "system", icon: "cellphone" },
  { label: "Light", value: "light", icon: "weather-sunny" },
  { label: "Dark", value: "dark", icon: "weather-night" },
];

export const Appearance = () => {
  const { colors } = useTheme();
  const { preference, setPreference } = useThemePreference();
  const selectedIdx = THEME_OPTIONS.findIndex(
    (opt) => opt.value === preference,
  );

  const [trackWidth, setTrackWidth] = useState(0);
  const segmentWidth = trackWidth / THEME_OPTIONS.length;

  const thumbX = useRef(new Animated.Value(0)).current;
  const positioned = useRef(false);
  useEffect(() => {
    if (!segmentWidth) return;
    const toValue = selectedIdx * segmentWidth;
    if (positioned.current) {
      Animated.spring(thumbX, {
        toValue,
        useNativeDriver: true,
        friction: 9,
        tension: 90,
      }).start();
    } else {
      thumbX.setValue(toValue);
      positioned.current = true;
    }
  }, [selectedIdx, segmentWidth, thumbX]);

  return (
    <SectionCard title="Appearance">
      <View
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        style={{
          flexDirection: "row",
          marginTop: SPACING.xs,
          padding: 0,
          borderRadius: RADIUS.lg,
          backgroundColor: colors.background,
        }}
      >
        {segmentWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: segmentWidth,
              borderRadius: RADIUS.md,
              backgroundColor: colors.surfaceVariant,
              transform: [{ translateX: thumbX }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
            }}
          />
        )}
        {THEME_OPTIONS.map((opt) => {
          const selected = preference === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={{
                flex: 1,
                alignItems: "center",
                gap: SPACING.xs,
                paddingVertical: SPACING.sm,
              }}
              accessibilityRole="button"
              accessibilityState={selected ? { selected: true } : {}}
              accessibilityLabel={opt.label}
              onPress={() => setPreference(opt.value)}
            >
              <MaterialCommunityIcons
                name={opt.icon}
                size={24}
                color={selected ? colors.primary : colors.onSurfaceDisabled}
              />
              <Text
                style={{
                  fontSize: FONT.sm,
                  color: selected ? colors.primary : colors.onSurface,
                  fontWeight: selected ? "700" : "400",
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SectionCard>
  );
};
