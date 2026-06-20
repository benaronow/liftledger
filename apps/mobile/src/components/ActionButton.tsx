import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Text, TouchableRipple, useTheme } from "../paper";
import type { AppColors } from "../paperTheme";
import { FONT, RADIUS, SPACING } from "../theme";

export type Variant =
  | "primary"
  | "primaryInverted"
  | "danger"
  | "dangerInverted";

// Mirrors web's ActionButton variant table. Returns both the fill and the
// foreground color so callers can tint their (vector) icon to match the label.
export const variantColors = (
  variant: Variant | undefined,
  disabled: boolean | undefined,
  colors: AppColors,
): { background: string; foreground: string } => {
  switch (variant) {
    case "primaryInverted":
      return {
        background: disabled ? colors.textDisabled : "white",
        foreground: disabled ? colors.primaryDisabled : colors.primary,
      };
    case "danger":
      return {
        background: disabled ? colors.dangerDisabled : colors.danger,
        foreground: disabled ? colors.textDisabled : "white",
      };
    case "dangerInverted":
      return {
        background: disabled ? colors.textDisabled : "white",
        foreground: disabled ? colors.dangerDisabled : colors.danger,
      };
    case "primary":
    default:
      return {
        background: disabled ? colors.primaryDisabled : colors.primary,
        foreground: disabled ? colors.textDisabled : "white",
      };
  }
};

const roundedStyle = (
  side: Props["roundedSide"],
): Pick<
  ViewStyle,
  | "borderRadius"
  | "borderTopLeftRadius"
  | "borderTopRightRadius"
  | "borderBottomLeftRadius"
  | "borderBottomRightRadius"
> => {
  const r = RADIUS.md;
  switch (side) {
    case "0":
      return { borderRadius: 0 };
    case "start":
      return { borderTopLeftRadius: r, borderBottomLeftRadius: r };
    case "end":
      return { borderTopRightRadius: r, borderBottomRightRadius: r };
    case "top":
      return { borderTopLeftRadius: r, borderTopRightRadius: r };
    case "bottom":
      return { borderBottomLeftRadius: r, borderBottomRightRadius: r };
    default:
      return { borderRadius: r };
  }
};

interface Props {
  label?: string;
  // A rendered icon node (MaterialCommunityIcons or an ActivityIndicator while
  // a button's action is in flight). Tint it to the variant foreground.
  icon: ReactNode;
  onPress: () => void;
  height?: number;
  width?: number;
  variant?: Variant;
  disabled?: boolean;
  roundedSide?: "start" | "end" | "top" | "bottom" | "0";
  style?: StyleProp<ViewStyle>;
}

// Paper TouchableRipple gives Material press feedback; the colored rectangular
// fill + variant table are kept so every existing call site (full-width CTAs,
// icon-only footer buttons, grouped input adornments) renders unchanged.
//
// Button convention: use this for grouped/segmented controls that need a square
// fill and `roundedSide` (timer presets, history row) — its variant table
// mirrors web. For standalone/dialog/form actions use Paper's <Button>. The
// dashboard "Lift!" CTA is an intentional one-off (see Dashboard.tsx).
export const ActionButton = ({
  label,
  icon,
  onPress,
  height,
  width,
  variant,
  disabled,
  roundedSide,
  style,
}: Props) => {
  const { colors } = useTheme();
  const { background, foreground } = variantColors(variant, disabled, colors);

  return (
    <TouchableRipple
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        {
          overflow: "hidden",
          backgroundColor: background,
          height: height ?? 35,
          // Full-width by default (web parity); callers in a row wrap in a flex
          // cell or pass an explicit width.
          width: width ?? "100%",
          ...roundedStyle(roundedSide),
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: SPACING.sm,
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.xs,
        }}
      >
        {label && (
          <Text style={{ fontWeight: "700", fontSize: FONT.base, color: foreground }}>
            {label}
          </Text>
        )}
        {icon}
      </View>
    </TouchableRipple>
  );
};
