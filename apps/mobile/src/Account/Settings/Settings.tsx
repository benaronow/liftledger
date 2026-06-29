import { ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import { SPACING } from "../../theme";
import { Appearance } from "./Appearance";

export const Settings = () => {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xxl,
        paddingHorizontal: SPACING.lg,
      }}
    >
      <Appearance />
    </ScrollView>
  );
};
