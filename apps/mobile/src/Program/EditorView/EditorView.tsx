import { useEffect, useRef } from "react";
import { EditSession } from "./EditSession/EditSession";
import { EditRotation } from "./EditRotation/EditRotation";
import { useTemplate } from "../TemplateProvider";
import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { floatingTabBarClearance } from "../../RootNavigator/TabNavigator/FloatingTabBar";
import { useTheme } from "react-native-paper";
import { SPACING } from "../../theme";
import { EditorTitle } from "./EditorTitle";

export const EditorView = () => {
  const { editingSessionIdx } = useTemplate();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Toggling between rotation- and session-editing swaps the whole view, so snap back
  // to the top instantly rather than carrying over the previous scroll offset.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [editingSessionIdx]);

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
            {editingSessionIdx === -1 ? <EditRotation /> : <EditSession />}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};
