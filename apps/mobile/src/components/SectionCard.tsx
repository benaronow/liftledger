import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../theme";

interface Props {
  title?: string;
  children: ReactNode;
  background?: string;
  titleColor?: string;
  /** Controls rendered in the title row, aligned to the right of the title. */
  headerRight?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SectionCard = ({
  title,
  children,
  background,
  titleColor,
  headerRight,
  style,
}: Props) => {
  const { colors } = useTheme();

  return (
    <Surface
      elevation={0}
      style={[
        {
          width: "100%",
          borderRadius: RADIUS.md,
          gap: SPACING.md,
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.md,
          backgroundColor: background ?? colors.primaryContainer,
        },
        style,
      ]}
    >
      {(title || headerRight) && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          {title ? (
            <Text
              style={{
                flexShrink: 1,
                color: titleColor ?? colors.onSurface,
                fontSize: FONT.base,
                fontWeight: "800",
              }}
            >
              {title}
            </Text>
          ) : (
            <View />
          )}
          {headerRight}
        </View>
      )}
      {children}
    </Surface>
  );
};
