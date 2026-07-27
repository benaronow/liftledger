import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import type { ProgramStackNav } from "../../RootNavigator/types";
import { EditorView } from "../EditorView";
import { ProgramFAB } from "../ProgramFAB";
import { useTemplate } from "../TemplateProvider";

export const SessionScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<ProgramStackNav<"Session">>();
  const { editingSessionIdx, setEditingSessionIdx } = useTemplate();
  const cancelRef = useRef<number | null>(null);

  useEffect(() => () => setEditingSessionIdx(-1), [setEditingSessionIdx]);

  useEffect(() => {
    if (editingSessionIdx === -1) navigation.goBack();
  }, [editingSessionIdx, navigation]);

  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;

    const unsub = parent.addListener("blur", () => {
      navigation.setOptions({ animation: "none" });
      const frame = requestAnimationFrame(() => navigation.popToTop());
      cancelRef.current = frame;
    });

    return () => {
      unsub();
      if (cancelRef.current != null) cancelAnimationFrame(cancelRef.current);
    };
  }, [navigation]);

  if (editingSessionIdx === -1) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <EditorView mode="session" />
      <ProgramFAB mode="session" />
    </View>
  );
};
