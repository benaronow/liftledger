import { COLORS } from "@liftledger/shared";
import { ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  Text,
  ViewStyle,
} from "react-native";
import { FONT, RADIUS, SPACING } from "../theme";

export type Variant =
  | "primary"
  | "primaryInverted"
  | "danger"
  | "dangerInverted";

// Mirrors web's ActionButton variant table. Returns both the fill and the
// foreground color so callers can tint their (vector) icon to match the label —
// web got this free via CSS color inheritance; RN icons need the color passed.
export const variantColors = (
  variant: Variant | undefined,
  disabled: boolean | undefined,
): { background: string; foreground: string } => {
  switch (variant) {
    case "primaryInverted":
      return {
        background: disabled ? COLORS.textDisabled : "white",
        foreground: disabled ? COLORS.primaryDisabled : COLORS.primary,
      };
    case "danger":
      return {
        background: disabled ? COLORS.dangerDisabled : COLORS.danger,
        foreground: disabled ? COLORS.textDisabled : "white",
      };
    case "dangerInverted":
      return {
        background: disabled ? COLORS.textDisabled : "white",
        foreground: disabled ? COLORS.dangerDisabled : COLORS.danger,
      };
    case "primary":
    default:
      return {
        background: disabled ? COLORS.primaryDisabled : COLORS.primary,
        foreground: disabled ? COLORS.textDisabled : "white",
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
  icon: ReactNode;
  onPress: () => void;
  height?: number;
  width?: number;
  variant?: Variant;
  disabled?: boolean;
  roundedSide?: "start" | "end" | "top" | "bottom" | "0";
  style?: StyleProp<ViewStyle>;
}

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
  const { background, foreground } = variantColors(variant, disabled);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: SPACING.sm,
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.xs,
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
      {label && (
        <Text style={{ fontWeight: "700", fontSize: FONT.base, color: foreground }}>{label}</Text>
      )}
      {icon}
    </Pressable>
  );
};
