import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useTheme } from "../providers/ThemeProvider";
import { FONT, SPACING } from "../theme";

export const NoDataPlaceholder = () => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.sm,
      }}
    >
      <Ionicons
        name="bar-chart-outline"
        size={96}
        color={colors.textDisabled}
        style={{ opacity: 0.5 }}
      />
      <Text style={{ fontSize: FONT.lg, color: colors.textDisabled }}>No data for this exercise</Text>
    </View>
  );
};
