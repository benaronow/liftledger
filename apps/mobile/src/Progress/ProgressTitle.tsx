import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { FAB_SIZE, titleRightInset } from "../layout";
import { FONT, SPACING } from "../theme";

interface Props {
  title: string;
  reserveButtons?: number;
}

export const ProgressTitle = ({ title, reserveButtons = 0 }: Props) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        paddingTop: SPACING.md,
        paddingLeft: SPACING.lg,
        paddingRight: reserveButtons
          ? titleRightInset(reserveButtons)
          : SPACING.lg,
      }}
    >
      <View style={{ height: FAB_SIZE, justifyContent: "center" }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: FONT.xl,
            fontWeight: "700",
            color: colors.onSurface,
          }}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};
