import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Surface, Text, useTheme } from "../paper";
import { FONT, RADIUS, SPACING } from "../theme";

interface Props {
  title: string;
  children: ReactNode;
  // Card fill. Defaults to colors.container; the Danger Zone passes colors.danger.
  background?: string;
  // Title color. Defaults to colors.text; pass white on the danger fill.
  titleColor?: string;
  // Per-call layout (e.g. marginBottom between stacked cards).
  style?: StyleProp<ViewStyle>;
}

// A titled, elevated section card — the shared container for settings/detail
// panels (Personal Info, Program Details, Appearance, Danger Zone). Children
// stack with the card's gap. For cards that also need a row of action buttons
// or a disabled overlay, use Info instead.
export const SectionCard = ({
  title,
  children,
  background,
  titleColor,
  style,
}: Props) => {
  const { colors } = useTheme();

  return (
    <Surface
      elevation={1}
      style={[
        {
          width: "100%",
          borderRadius: RADIUS.md,
          gap: SPACING.md,
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.md,
          backgroundColor: background ?? colors.container,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: titleColor ?? colors.text,
          fontSize: FONT.base,
          fontWeight: "800",
          alignSelf: "flex-start",
        }}
      >
        {title}
      </Text>
      {children}
    </Surface>
  );
};
