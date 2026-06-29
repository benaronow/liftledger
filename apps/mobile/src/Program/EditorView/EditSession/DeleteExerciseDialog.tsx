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
  const { templateProgram, setTemplateProgram, editingRotationIdx, editingSessionIdx } =
    useTemplate();

  const handleRemoveExercise = () => {
    const session = templateProgram.rotations[editingRotationIdx][editingSessionIdx];
    if (session.exercises.length > 1 && deletingExerciseIdx !== undefined) {
      // deletingExerciseIdx is the position in the *visible* list; map it to the
      // full-array index so a hidden addedOn exercise isn't deleted in its place.
      const fullIdx = fullExerciseIndex(session.exercises, deletingExerciseIdx);
      setTemplateProgram({
        ...templateProgram,
        rotations: templateProgram.rotations.map((rotation, wIdx) =>
          wIdx === editingRotationIdx
            ? rotation.map((d, dIdx) =>
                dIdx === editingSessionIdx
                  ? { ...d, exercises: d.exercises.toSpliced(fullIdx, 1) }
                  : d,
              )
            : rotation,
        ),
      });
    }
    onClose();
  };

  return (
    <ConfirmationDialog
      open={deletingExerciseIdx !== undefined}
      onClose={onClose}
      title="Delete Exercise"
      icon="alert"
      destructive
      onConfirm={handleRemoveExercise}
      description="Are you sure you want to delete this exercise?"
      emphasis="This action cannot be undone."
    />
  );
};
