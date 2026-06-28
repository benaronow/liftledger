import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { FONT, SPACING } from "../../../theme";
import { Align } from "./quadrants/Quadrant";

type Props = {
  label: string;
  value: string;
  align: Align;
};

export const TitleRow = ({ label, value, align }: Props) => {
  const { colors } = useTheme();
  const labelEl = (
    <Text
      style={{
        flexShrink: 0,
        fontSize: FONT.xs,
        fontWeight: "800",
        letterSpacing: 1,
        color: colors.onSurfaceDisabled,
      }}
    >
      {label}
    </Text>
  );
  const valueEl = (
    <Text
      numberOfLines={1}
      style={{
        flexShrink: 1,
        fontSize: FONT.lg,
        fontWeight: "900",
        color: colors.onSurface,
      }}
    >
      {value}
    </Text>
  );
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        justifyContent: align === "right" ? "flex-end" : "flex-start",
      }}
    >
      {align === "right" ? (
        <>
          {valueEl}
          {labelEl}
        </>
      ) : (
        <>
          {labelEl}
          {valueEl}
        </>
      )}
    </View>
  );
};
