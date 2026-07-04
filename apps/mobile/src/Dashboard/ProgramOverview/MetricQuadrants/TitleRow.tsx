import { ReactNode } from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { FONT, SPACING } from "../../../theme";
import { Align } from "./quadrants/Quadrant";

type Props = {
  label: string;
  value: string;
  align: Align;
  labelLeading?: ReactNode;
  labelTrailing?: ReactNode;
};

export const TitleRow = ({ label, value, align, labelLeading, labelTrailing }: Props) => {
  const { colors } = useTheme();
  const labelEl = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.xs,
        flexShrink: 0,
      }}
    >
      {labelLeading}
      <Text
        style={{
          fontSize: FONT.xs,
          fontWeight: "800",
          letterSpacing: 1,
          color: colors.onSurfaceDisabled,
        }}
      >
        {label}
      </Text>
      {labelTrailing}
    </View>
  );
  const valueEl = (
    <Text
      numberOfLines={1}
      style={{
        flexShrink: 1,
        fontSize: FONT.base,
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
        justifyContent: "space-between",
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
