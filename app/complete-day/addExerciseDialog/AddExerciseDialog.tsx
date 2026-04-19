import { DialogAction, ActionDialog } from "@/app/components/ActionDialog";
import { EditExercise } from "./EditExercise";
import { useEffect, useState } from "react";
import { Block, Day, Exercise } from "@/lib/types";
import { useBlock } from "@/app/providers/BlockProvider";
import { FaSave } from "react-icons/fa";
import { useCompleteDay } from "../CompleteDayProvider";
import { IoArrowBack } from "react-icons/io5";
import { Spinner } from "react-bootstrap";

export const AddExerciseDialog = () => {
  const { curBlock, updateBlock } = useBlock();
  const { addExerciseIdx, setAddExerciseIdx, exercises } = useCompleteDay();
  const [addingExercise, setAddingExercise] = useState(false);

  const defaultNewExercise: Exercise = {
    name: "",
    apparatus: "",
    gym: curBlock?.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].gym || "",
    weightType: "",
    sets: [],
    addedOn: true,
  };
  const [newExercise, setNewExercise] = useState<Exercise>(defaultNewExercise);
  useEffect(() => setNewExercise(defaultNewExercise), [addExerciseIdx]);

  const saveExercises = async (exercises: Exercise[]) => {
    if (!curBlock) return;
    const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].toSpliced(
      curBlock.curDayIdx,
      1,
      {
        ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
        exercises,
      },
    );

    const newBlock: Block = {
      ...curBlock,
      weeks: curBlock?.weeks.toSpliced(curBlock.curWeekIdx, 1, newDays),
    };

    await updateBlock(newBlock);
  };

  const handleAddExercise = async () => {
    setAddingExercise(true);

    const updatedExercises = exercises.toSpliced(
      addExerciseIdx ?? exercises.length,
      0,
      newExercise,
    );
    await saveExercises(updatedExercises);

    setAddExerciseIdx(undefined);
    setAddingExercise(false);
  };

  const editActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setAddExerciseIdx(undefined),
      variant: "primaryInverted",
      disabled: addingExercise,
    },
    {
      icon: addingExercise ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <FaSave fontSize={28} />
      ),
      onClick: handleAddExercise,
      disabled:
        addingExercise ||
        newExercise.name === "" ||
        newExercise.apparatus === "" ||
        newExercise.weightType === "",
      variant: "primary",
    },
  ];

  return (
    <>
      {addExerciseIdx !== undefined && (
        <ActionDialog
          open={addExerciseIdx !== undefined}
          onClose={() => setAddExerciseIdx(undefined)}
          title="Add Exercise"
          actions={editActions}
        >
          <EditExercise
            newExercise={newExercise}
            setNewExercise={setNewExercise}
            exercisesState={exercises}
          />
        </ActionDialog>
      )}
    </>
  );
};
