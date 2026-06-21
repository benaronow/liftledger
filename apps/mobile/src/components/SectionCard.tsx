import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Surface, Text, useTheme } from "../paper";
import { FONT, RADIUS, SPACING } from "../theme";

interface Props {
  title?: string;
  children: ReactNode;
  background?: string;
  titleColor?: string;
  style?: StyleProp<ViewStyle>;
}

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
      {title && (
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
      )}
      {children}
    </Surface>
  );
};
