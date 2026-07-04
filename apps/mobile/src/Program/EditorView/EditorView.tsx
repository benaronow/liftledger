import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { SelectModalContext } from "../../components/SearchableSelect";
import { EditorTitle } from "./EditorTitle";

export const EditorView = () => {
  const { editingSessionIdx } = useTemplate();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [openSelectCount, setOpenSelectCount] = useState(0);
  const registerOpenSelect = useCallback(() => {
    setOpenSelectCount((c) => c + 1);
    return () => setOpenSelectCount((c) => c - 1);
  }, []);
  const selectModalValue = useMemo(
    () => ({ register: registerOpenSelect }),
    [registerOpenSelect],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [editingSessionIdx]);

  return (
    <SelectModalContext.Provider value={selectModalValue}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingBottom: floatingTabBarClearance(insets.bottom),
        }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={openSelectCount === 0}
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
    </SelectModalContext.Provider>
  );
};
