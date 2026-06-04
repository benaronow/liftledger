import { COLORS } from "@liftledger/shared";
import { StyleSheet, Text, View } from "react-native";
import { FONT } from "../theme";

// Temporary stub for screens not yet built. Each milestone replaces the
// corresponding screen with its real implementation.
export const Placeholder = ({ title }: { title: string }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  text: { color: "white", fontSize: FONT.lg, fontWeight: "600" },
});
