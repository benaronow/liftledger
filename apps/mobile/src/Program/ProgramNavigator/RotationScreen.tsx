import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { EditorView } from "../EditorView";
import { ProgramFAB } from "../ProgramFAB";

export const RotationScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <EditorView mode="rotation" />
      <ProgramFAB mode="rotation" />
    </View>
  );
};
