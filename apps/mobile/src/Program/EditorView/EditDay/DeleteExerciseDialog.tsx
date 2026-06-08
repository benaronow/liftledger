import { View } from "react-native";
import { Text, useTheme } from "../../../paper";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { FONT, SPACING } from "../../../theme";
import { useTemplate } from "../../TemplateProvider";

interface Props {
  deletingExerciseIdx: number | undefined;
  onClose: () => void;
}

export const DeleteExerciseDialog = ({
  deletingExerciseIdx,
  onClose,
}: Props) => {
  const { colors } = useTheme();
  const { templateProgram, setTemplateProgram, editingWeekIdx, editingDayIdx } =
    useTemplate();

  const handleRemoveExercise = () => {
    if (templateProgram.weeks[editingWeekIdx][editingDayIdx].exercises.length > 1)
      setTemplateProgram({
        ...templateProgram,
        weeks: templateProgram.weeks.map((week, wIdx) =>
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

  if (deletingExerciseIdx === undefined) return null;

  return (
    <ConfirmationDialog
      open={deletingExerciseIdx !== undefined}
      onClose={onClose}
      title="Delete Exercise"
      onConfirm={handleRemoveExercise}
    >
      <View style={{ width: "100%", gap: SPACING.md }}>
        <Text style={{ color: colors.text, fontSize: FONT.base }}>
          Are you sure you want to delete this exercise?
        </Text>
        <Text
          style={{ color: colors.text, fontSize: FONT.base, fontWeight: "700" }}
        >
          This action cannot be undone.
        </Text>
      </View>
    </ConfirmationDialog>
  );
};
