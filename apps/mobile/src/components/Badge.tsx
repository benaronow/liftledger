import { Text, useTheme } from "react-native-paper";
import { RADIUS, SPACING } from "../theme";

interface Props {
  label: string;
  // Defaults to colors.surface; pass an explicit color to keep contrast
  // against a surface that already uses the container color.
  background?: string;
}

// A small uppercase pill (e.g. the "ADD-ON" tag) shown beside an exercise name.
export const Badge = ({ label, background }: Props) => {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 0.5,
        color: colors.onSurface,
        backgroundColor: background ?? colors.surface,
        borderRadius: RADIUS.sm,
        overflow: "hidden",
      }}
    >
      {label}
    </Text>
  );
};
