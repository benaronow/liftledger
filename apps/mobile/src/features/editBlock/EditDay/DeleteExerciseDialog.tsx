import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { StyleSheet, Text, View } from "react-native";
import { ActionDialog, DialogAction } from "../../../components/ActionDialog";
import { FONT, SPACING } from "../../../theme";
import { useTemplate } from "../TemplateProvider";

interface Props {
  deletingExerciseIdx: number | undefined;
  onClose: () => void;
}

export const DeleteExerciseDialog = ({
  deletingExerciseIdx,
  onClose,
}: Props) => {
  const { templateBlock, setTemplateBlock, editingWeekIdx, editingDayIdx } =
    useTemplate();

  const handleRemoveExercise = () => {
    if (
      templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises.length > 1
    )
      setTemplateBlock({
        ...templateBlock,
        weeks: templateBlock.weeks.map((week, wIdx) =>
          wIdx === editingWeekIdx
            ? week.map((day, dIdx) =>
                dIdx === editingDayIdx && deletingExerciseIdx !== undefined
                  ? {
                      ...day,
                      exercises: day.exercises.toSpliced(
                        deletingExerciseIdx,
                        1,
                      ),
                    }
                  : day,
              )
            : week,
        ),
      });
    onClose();
  };

  const actions: DialogAction[] = [
    {
      icon: <Ionicons name="arrow-back" size={26} color={COLORS.danger} />,
      onPress: onClose,
      variant: "dangerInverted",
    },
    {
      icon: <Ionicons name="trash" size={24} color="white" />,
      onPress: handleRemoveExercise,
      variant: "danger",
    },
  ];

  if (deletingExerciseIdx === undefined) return null;

  return (
    <ActionDialog
      open={deletingExerciseIdx !== undefined}
      onClose={onClose}
      title="Delete Exercise"
      actions={actions}
    >
      <View style={styles.body}>
        <Text style={styles.text}>
          Are you sure you want to delete this exercise?
        </Text>
        <Text style={styles.bold}>This action cannot be undone.</Text>
      </View>
    </ActionDialog>
  );
};

const styles = StyleSheet.create({
  body: { width: "100%", gap: SPACING.md },
  text: { color: "white", fontSize: FONT.base },
  bold: { color: "white", fontSize: FONT.base, fontWeight: "700" },
});
