import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { StyleSheet, Text, View } from "react-native";
import { FONT, SPACING } from "../../theme";

export const NoDataPlaceholder = () => (
  <View style={styles.container}>
    <Ionicons
      name="bar-chart-outline"
      size={96}
      color={COLORS.textDisabled}
      style={styles.icon}
    />
    <Text style={styles.text}>No data for this exercise</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  icon: { opacity: 0.5 },
  text: { fontSize: FONT.lg, color: COLORS.textDisabled },
});
