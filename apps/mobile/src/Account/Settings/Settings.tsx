import { ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SPACING } from "../../theme";
import { Appearance } from "./Appearance";
import { DefaultTimer } from "./DefaultTimer";
import { DefaultUnit } from "./DefaultUnit";
import { ExerciseLists } from "./ExerciseLists";

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
      <View style={{ gap: SPACING.lg }}>
        <Appearance />
        <DefaultUnit />
        <DefaultTimer />
        <ExerciseLists />
      </View>
    </ScrollView>
  );
};
