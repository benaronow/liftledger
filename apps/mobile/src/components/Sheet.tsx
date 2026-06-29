import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { SPACING } from "../theme";
import { SheetAction, SheetHeader } from "./SheetHeader";

interface Props {
  title: string;
  actions: SheetAction[];
  children: ReactNode;
  // Wrap in a KeyboardAvoidingView — for sheets whose own content holds a text
  // field (e.g. the gym search), so the keyboard doesn't cover it.
  keyboardAvoiding?: boolean;
}

// The body of a full-screen page sheet: a dark container inset below the status
// bar (on Android) with a SheetHeader pinned on top. Pair with a
// <Modal presentationStyle="pageSheet">; pass the sheet's scroll/list content
// as children.
export const Sheet = ({ title, actions, children, keyboardAvoiding }: Props) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const body = (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.primaryContainer,
        paddingTop: (Platform.OS === "android" ? insets.top : 0) + SPACING.md,
      }}
    >
      <SheetHeader title={title} actions={actions} />
      {children}
    </View>
  );

  return keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.primaryContainer }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );
};
