import { COLORS } from "@liftledger/shared";
import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FONT, SPACING } from "../../theme";

interface Props {
  children: ReactNode;
  label?: string;
  error?: string;
  renderEnd?: () => ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Stacks a label above an input row (with an optional trailing element) and an
// error line below — the shared chrome for every Labeled* input.
export const LabeledInputContainer = ({
  children,
  label,
  error,
  renderEnd,
  style,
}: Props) => (
  <View style={[styles.container, style]}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.row}>
      {children}
      {renderEnd?.()}
    </View>
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { width: "100%", gap: SPACING.xs, alignItems: "flex-start" },
  label: { fontSize: FONT.sm, fontWeight: "600", color: "white" },
  row: { flexDirection: "row", width: "100%", alignItems: "center" },
  error: { fontSize: FONT.xs, color: COLORS.danger },
});
