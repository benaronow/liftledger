import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { useTemplate } from "../../TemplateProvider";
import { fullExerciseIndex } from "./moveExercise";

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
    const day = templateProgram.weeks[editingWeekIdx][editingDayIdx];
    if (day.exercises.length > 1 && deletingExerciseIdx !== undefined) {
      // deletingExerciseIdx is the position in the *visible* list; map it to the
      // full-array index so a hidden addedOn exercise isn't deleted in its place.
      const fullIdx = fullExerciseIndex(day.exercises, deletingExerciseIdx);
      setTemplateProgram({
        ...templateProgram,
        weeks: templateProgram.weeks.map((week, wIdx) =>
          wIdx === editingWeekIdx
            ? week.map((d, dIdx) =>
                dIdx === editingDayIdx
                  ? { ...d, exercises: d.exercises.toSpliced(fullIdx, 1) }
                  : d,
              )
            : week,
        ),
      });
    }
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
