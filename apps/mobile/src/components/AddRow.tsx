import { View } from "react-native";
import { Divider, IconButton, useTheme } from "../paper";
import { SPACING } from "../theme";

interface Props {
  onPress: () => void;
}

export const AddRow = ({ onPress }: Props) => {
  const { colors } = useTheme();
  const lineStyle = { flex: 1, height: 2, backgroundColor: colors.primary };
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
        mode="contained"
        size={18}
        containerColor={colors.primary}
        iconColor={colors.onPrimary}
        onPress={onPress}
      />
      <Divider style={lineStyle} />
    </View>
  );
};
