import { EditDay } from "./EditDay/EditDay";
import { EditWeek } from "./EditWeek/EditWeek";
import { useTemplate } from "../TemplateProvider";
import { ScrollView } from "react-native";
import { SPACING } from "../../theme";

export const EditorView = () => {
  const { editingDayIdx } = useTemplate();

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.xl,
        alignItems: "center",
      }}
      keyboardShouldPersistTaps="handled"
      // Scroll a focused field (block name, day name, weeks) above the
      // keyboard instead of letting the keyboard cover the lower form.
      automaticallyAdjustKeyboardInsets
    >
      {editingDayIdx === -1 ? <EditWeek /> : <EditDay />}
    </ScrollView>
  );
};
