import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditSession } from "./EditSession/EditSession";
import { EditRotation } from "./EditRotation/EditRotation";
import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { floatingTabBarClearance } from "../../RootNavigator/TabNavigator/FloatingTabBar";
import { useTheme } from "react-native-paper";
import { SPACING } from "../../theme";
import { SelectModalContext } from "../../components/SearchableSelect";
import { EditorTitle } from "./EditorTitle";

export const EditorView = ({ mode }: { mode: "rotation" | "session" }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (mode !== "rotation") return;
    const unsub = navigation.getParent()?.addListener("blur", () => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
    return unsub;
  }, [mode, navigation]);

  const [openSelectCount, setOpenSelectCount] = useState(0);
  const registerOpenSelect = useCallback(() => {
    setOpenSelectCount((c) => c + 1);
    return () => setOpenSelectCount((c) => c - 1);
  }, []);
  const selectModalValue = useMemo(
    () => ({ register: registerOpenSelect }),
    [registerOpenSelect],
  );

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
            <EditorTitle mode={mode} />
            <View
              style={{
                paddingHorizontal: SPACING.lg,
                paddingTop: SPACING.md,
                paddingBottom: SPACING.xl,
                alignItems: "center",
              }}
            >
              {mode === "session" ? <EditSession /> : <EditRotation />}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SelectModalContext.Provider>
  );
};
