import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { useTemplate } from "../../TemplateProvider";

interface Props {
  deletingExerciseIdx: number | undefined;
  onClose: () => void;
}

export const DeleteExerciseDialog = ({
  deletingExerciseIdx,
  onClose,
}: Props) => {
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
      description="Are you sure you want to delete this exercise?"
      emphasis="This action cannot be undone."
    />
  );
};
