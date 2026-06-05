import { Text, View } from "react-native";
import { useTheme } from "../providers/ThemeProvider";
import { FONT } from "../theme";

// Temporary stub for screens not yet built. Each milestone replaces the
// corresponding screen with its real implementation.
export const Placeholder = ({ title }: { title: string }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ fontSize: FONT.lg, fontWeight: "600", color: colors.text }}>{title}</Text>
    </View>
  );
};
