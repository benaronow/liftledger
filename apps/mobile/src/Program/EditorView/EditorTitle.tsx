import { useProgram, useMe } from "@liftledger/api-client";
import { View } from "react-native";
import { Text, useTheme } from "../../paper";
import { FONT } from "../../theme";
import { FAB_EDGE, FAB_SIZE, FAB_TOP, titleRightInset } from "../../layout";
import { useTemplate } from "../TemplateProvider";

export const EditorTitle = () => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { editingDayIdx } = useTemplate();

  const isEditingDay = editingDayIdx !== -1;

  // Mirror the FAB cluster: Save (+ Quit when a program exists) on the week
  // view, a single Back button on the day view.
  const fabCount = isEditingDay ? 1 : curProgram ? 2 : 1;

  const title = isEditingDay
    ? `Edit Day ${editingDayIdx + 1}`
    : curProgram
      ? "Edit Program"
      : "Create Program";

  return (
    <View
      style={{
        paddingTop: FAB_TOP,
        paddingLeft: FAB_EDGE,
        paddingRight: titleRightInset(fabCount),
      }}
    >
      <View style={{ height: FAB_SIZE, justifyContent: "center" }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: FONT.xl, fontWeight: "700", color: colors.text }}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};
