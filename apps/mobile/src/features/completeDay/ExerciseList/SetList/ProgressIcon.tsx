import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  sign?: number;
  isSetComplete: boolean;
  isSetSkipped?: boolean;
}

// A colored circle + glyph summarizing how a logged set compares to its last
// occurrence (up = heavier/more, down = lighter/fewer, even = no change),
// or its pending/skipped state. Mirrors web's ProgressIcon.
export const ProgressIcon = ({ sign, isSetComplete, isSetSkipped }: Props) => {
  const background = useMemo(() => {
    if (!isSetComplete && !isSetSkipped) return COLORS.container;
    if (sign === undefined || isSetSkipped) return COLORS.background;
    if (sign === 0) return COLORS.warning;
    return sign > 0 ? COLORS.success : COLORS.danger;
  }, [sign, isSetComplete, isSetSkipped]);

  const icon = useMemo(() => {
    if (isSetSkipped)
      return { name: "play-skip-forward" as const, size: 16 };
    if (!isSetComplete)
      return { name: "ellipsis-horizontal" as const, size: 18 };
    if (sign && sign > 0) return { name: "chevron-up" as const, size: 18 };
    if (sign && sign < 0) return { name: "chevron-down" as const, size: 18 };
    // Complete with history → "even" (no change); complete without → empty.
    return sign !== undefined
      ? { name: "reorder-two" as const, size: 16 }
      : { name: "ellipse-outline" as const, size: 14 };
  }, [sign, isSetComplete, isSetSkipped]);

  return (
    <View style={[styles.circle, { backgroundColor: background }]}>
      <Ionicons name={icon.name} size={icon.size} color="white" />
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
