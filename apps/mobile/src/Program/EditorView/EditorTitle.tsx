import { useProgram, useMe } from "@liftledger/api-client";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { FONT, SPACING } from "../../theme";
import { FAB_SIZE, titleRightInset } from "../../layout";
import { useTemplate } from "../TemplateProvider";

export const EditorTitle = () => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { editingSessionIdx } = useTemplate();

  const isEditingSession = editingSessionIdx !== -1;

  const fabCount = isEditingSession ? 1 : curProgram ? 2 : 1;

  const title = isEditingSession
    ? `Edit Session ${editingSessionIdx + 1}`
    : curProgram
      ? "Edit Program"
      : "Create Program";

  return (
    <View
      style={{
        paddingTop: SPACING.md,
        paddingLeft: SPACING.lg,
        paddingRight: titleRightInset(fabCount),
      }}
    >
      <View style={{ height: FAB_SIZE, justifyContent: "center" }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: FONT.xl,
            fontWeight: "700",
            color: colors.onSurface,
          }}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};
