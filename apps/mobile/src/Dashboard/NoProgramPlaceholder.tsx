import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button, Text, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../theme";
import { TabNav } from "../RootNavigator/types";

export const NoProgramPlaceholder = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<TabNav<"Dashboard">>();

  return (
    <View style={{ alignItems: "center", gap: SPACING.xl }}>
      <Text
        style={{
          fontSize: FONT.base,
          fontWeight: "900",
          textAlign: "center",
          color: colors.onSurface,
        }}
      >
        Create a training program to get started!
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("Program")}
        style={{ minWidth: 180, borderRadius: RADIUS.md }}
        contentStyle={{ paddingVertical: SPACING.xs }}
        labelStyle={{ fontSize: FONT.base, fontWeight: "600" }}
      >
        Create program
      </Button>
    </View>
  );
};
