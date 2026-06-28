import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DARK_COLORS } from "@liftledger/shared";
import { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

interface Props {
  sign?: number;
  isSetComplete: boolean;
  isSetSkipped?: boolean;
}

// A colored circle + glyph summarizing how a logged set compares to its last
// occurrence (up = heavier/more, down = lighter/fewer, even = no change),
// or its pending/skipped state. Mirrors web's ProgressIcon.
export const ProgressIcon = ({ sign, isSetComplete, isSetSkipped }: Props) => {
  const { colors } = useTheme();
  const background = useMemo(() => {
    // Neutral (pending / skipped / no-history) states use fixed dark-palette
    // grays rather than theme-relative ones, so the white glyph stays legible
    // and the icon looks identical in light and dark mode.
    if (!isSetComplete && !isSetSkipped) return DARK_COLORS.lightContainer;
    if (sign === undefined || isSetSkipped) return DARK_COLORS.background;
    if (sign === 0) return colors.tertiaryContainer;
    return sign > 0 ? colors.tertiary : colors.error;
  }, [sign, isSetComplete, isSetSkipped, colors]);

  const icon = useMemo(() => {
    if (isSetSkipped)
      return { name: "skip-next" as const, size: 16 };
    if (!isSetComplete)
      return { name: "dots-horizontal" as const, size: 18 };
    if (sign && sign > 0) return { name: "chevron-up" as const, size: 18 };
    if (sign && sign < 0) return { name: "chevron-down" as const, size: 18 };
    // Complete with history → "even" (no change); complete without → empty.
    return sign !== undefined
      ? { name: "equal" as const, size: 16 }
      : { name: "circle-outline" as const, size: 14 };
  }, [sign, isSetComplete, isSetSkipped]);

  return (
    <View
      style={{
        width: 25,
        height: 25,
        borderRadius: 12.5,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: background,
      }}
    >
      <MaterialCommunityIcons name={icon.name} size={icon.size} color="white" />
    </View>
  );
};
