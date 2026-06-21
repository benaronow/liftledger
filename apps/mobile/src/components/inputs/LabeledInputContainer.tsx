import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { HelperText, Text } from "../../paper";
import { SPACING } from "../../theme";

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
    {label && (
      <Text variant="labelLarge" style={{ fontWeight: "600" }}>
        {label}
      </Text>
    )}
    <View style={{ flexDirection: "row", width: "100%", alignItems: "center" }}>
      {children}
      {renderEnd?.()}
    </View>
    {error ? (
      <HelperText type="error" visible padding="none" style={{ paddingTop: 0 }}>
        {error}
      </HelperText>
    ) : null}
  </View>
);
