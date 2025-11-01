import { DialogAction, ActionDialog } from "@/app/components/ActionDialog";
import { EditExercise } from "./EditExercise";
import { Dispatch, SetStateAction, useState } from "react";
import { Block, Day, Exercise } from "@/lib/types";
import { useBlock } from "@/app/providers/BlockProvider";
import { FaSave } from "react-icons/fa";

interface Props {
  addIdx: number;
  exercisesState: Exercise[];
  setExercisesState: Dispatch<SetStateAction<Exercise[]>>;
  onClose: () => void;
}

export const AddExerciseDialog = ({
  addIdx,
  exercisesState,
  setExercisesState,
  onClose,
}: Props) => {
  const { curBlock, updateBlock } = useBlock();
  const [exerciseState, setExerciseState] = useState<Exercise>({
    name: "",
    apparatus: "",
    weightType: "",
    sets: [],
    addedOn: true,
  });

  const saveExercises = (exercises: Exercise[]) => {
    if (curBlock) {
      const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].toSpliced(
        curBlock.curDayIdx,
        1,
        {
          ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
          exercises,
        }
      );

      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock?.weeks.toSpliced(curBlock.curWeekIdx, 1, newDays),
      };

      updateBlock(newBlock);
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
      onClick: handleSubmitExercise,
      disabled:
        exerciseState.name === "" ||
        exerciseState.apparatus === "" ||
        exerciseState.weightType === "",
      variant: "primary",
    },
  ];

  return (
    <ActionDialog
      open={true}
      onClose={onClose}
      title="Submit Set"
      actions={editActions}
    >
      <EditExercise
        exerciseState={exerciseState}
        setExerciseState={setExerciseState}
        exercisesState={exercisesState}
      />
    </ActionDialog>
  );
};
