import { DialogAction, ActionDialog } from "@/app/components/ActionDialog";
import { EditExercise } from "./EditExercise";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Block, Day, Exercise } from "@/lib/types";
import { useBlock } from "@/app/providers/BlockProvider";
import { FaSave } from "react-icons/fa";

export type ChangeExerciseType = "name" | "apparatus" | "weightType";

interface Props {
  addIdx: number;
  exercisesState: Exercise[];
  setExercisesState: Dispatch<SetStateAction<Exercise[]>>;
  onClose: () => void;
}

export const SubmitExerciseDialog = ({
  addIdx,
  exercisesState,
  setExercisesState,
  onClose,
}: Props) => {
  const { curBlock, editBlock } = useBlock();

  const newExercise: Exercise = {
    name: "",
    apparatus: "",
    weightType: "",
    sets: [],
    addedOn: true,
  };

  const [exerciseState, setExerciseState] = useState<Exercise>(newExercise);

  const takenExercises = useMemo(() => {
    return exercisesState.filter(
      (e) =>
        !(
          e.name === exerciseState.name &&
          e.apparatus === exerciseState.apparatus
        )
    );
  }, [exercisesState, exerciseState]);

  const saveExercises = (complete: Exercise[]) => {
    if (curBlock) {
      const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].toSpliced(
        curBlock.curDayIdx,
        1,
        {
          ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
          exercises: complete,
        }
      );

      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock?.weeks.toSpliced(curBlock.curWeekIdx, 1, newDays),
      };

      editBlock(newBlock);
    }
  };

  const handleSubmitExercise = () => {
    const updatedExercises = exercisesState.toSpliced(addIdx, 0, exerciseState);
    setExercisesState(updatedExercises);
    saveExercises(updatedExercises);
    onClose();
  };

  const editActions: DialogAction[] = [
    {
      icon: <FaSave fontSize={28} />,
      onClick: () => handleSubmitExercise(),
      disabled:
        exerciseState.name === "" ||
        exerciseState.apparatus === "" ||
        exerciseState.weightType === "",
      variant: "primary",
    },
  ];

  return (
    <ActionDialog
      open={!!exerciseState}
      onClose={onClose}
      title="Submit Set"
      actions={editActions}
    >
      <EditExercise
        exerciseState={exerciseState}
        setExerciseState={setExerciseState}
        takenExercises={takenExercises}
      />
    </ActionDialog>
  );
};
