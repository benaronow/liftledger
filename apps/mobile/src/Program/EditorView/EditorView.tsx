import { useEffect, useRef } from "react";
import { EditDay } from "./EditDay/EditDay";
import { EditWeek } from "./EditWeek/EditWeek";
import { useTemplate } from "../TemplateProvider";
import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { floatingTabBarClearance } from "../../RootNavigator/TabNavigator/FloatingTabBar";
import { useTheme } from "../../paper";
import { SPACING } from "../../theme";
import { EditorTitle } from "./EditorTitle";

export const EditorView = () => {
  const { editingDayIdx } = useTemplate();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Toggling between week- and day-editing swaps the whole view, so snap back
  // to the top instantly rather than carrying over the previous scroll offset.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [editingDayIdx]);

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingBottom: floatingTabBarClearance(insets.bottom),
      }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View>
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
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};
