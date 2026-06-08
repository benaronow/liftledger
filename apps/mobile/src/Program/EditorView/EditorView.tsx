import { EditDay } from "./EditDay/EditDay";
import { EditWeek } from "./EditWeek/EditWeek";
import { useTemplate } from "../TemplateProvider";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { floatingTabBarClearance } from "../../RootNavigator/TabNavigator/FloatingTabBar";
import { useTheme } from "../../paper";
import { SPACING } from "../../theme";
import { EditorTitle } from "./EditorTitle";

export const EditorView = () => {
  const { editingDayIdx } = useTemplate();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      // Bottom padding keeps the last item reachable above the floating tab
      // pill while the scroll itself runs full-screen behind it (the blur
      // overlay sits on top of whatever passes underneath).
      contentContainerStyle={{
        paddingBottom: floatingTabBarClearance(insets.bottom),
      }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <EditorTitle />
      <View
        style={{
          paddingHorizontal: SPACING.lg,
          paddingTop: SPACING.md,
          paddingBottom: SPACING.xl,
          alignItems: "center",
        }}
      >
        {editingDayIdx === -1 ? <EditWeek /> : <EditDay />}
      </View>
    </ScrollView>
  );
};
