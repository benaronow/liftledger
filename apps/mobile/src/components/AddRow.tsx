import { View } from "react-native";
import { Divider, IconButton, useTheme } from "react-native-paper";
import { SPACING } from "../theme";

interface Props {
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export const AddRow = ({ onPress, accessibilityLabel, disabled }: Props) => {
  const { colors } = useTheme();
  const lineColor = disabled ? colors.surfaceDisabled : colors.primary;
  const lineStyle = { flex: 1, height: 2, backgroundColor: lineColor };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        width: "90%",
        // Match Info's marginBottom so the row sits centered between cards.
        marginBottom: SPACING.md,
      }}
    >
      <Divider style={lineStyle} />
      <IconButton
        style={{ margin: 0, marginHorizontal: SPACING.sm }}
        icon="plus"
        accessibilityLabel={accessibilityLabel}
        mode="contained"
        size={18}
        containerColor={lineColor}
        iconColor={colors.onPrimary}
        disabled={disabled}
        onPress={onPress}
      />
      <Divider style={lineStyle} />
    </View>
  );
};
