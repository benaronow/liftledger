import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text, useTheme } from "../paper";
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
      <MaterialCommunityIcons
        name="chart-bar"
        size={96}
        color={colors.textDisabled}
        style={{ opacity: 0.5 }}
      />
      <Text style={{ fontSize: FONT.lg, color: colors.textDisabled }}>No data for this exercise</Text>
    </View>
  );
};
