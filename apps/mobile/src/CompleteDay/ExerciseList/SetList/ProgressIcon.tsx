import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "../../../paper";

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
    if (!isSetComplete && !isSetSkipped) return colors.container;
    if (sign === undefined || isSetSkipped) return colors.background;
    if (sign === 0) return colors.warning;
    return sign > 0 ? colors.success : colors.danger;
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
