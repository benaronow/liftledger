import { COLORS } from "@liftledger/shared";
import { ReactNode } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
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
  <View style={[{ width: "100%", gap: SPACING.xs, alignItems: "flex-start" }, style]}>
    {label && <Text style={{ fontSize: FONT.sm, fontWeight: "600", color: "white" }}>{label}</Text>}
    <View style={{ flexDirection: "row", width: "100%", alignItems: "center" }}>
      {children}
      {renderEnd?.()}
    </View>
    {error && <Text style={{ fontSize: FONT.xs, color: COLORS.danger }}>{error}</Text>}
  </View>
);
