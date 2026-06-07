import { Block, Day, Exercise } from "@liftledger/shared";
import { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "../../../providers/SnackbarProvider";
import {
  useBlock,
  useCurrentDay,
  useMe,
  useUpdateUserBlock,
} from "@liftledger/api-client";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { EditExercise } from "./EditExercise";

interface Props {
  addExerciseIdx: number | undefined;
  onClose: () => void;
}

export const AddExerciseDialog = ({ addExerciseIdx, onClose }: Props) => {
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { trigger: triggerUpdateUserBlock, isMutating: addingExercise } =
    useUpdateUserBlock();
  const { exercises } = useCurrentDay();
  const { showSnackbar } = useSnackbar();

  const curGym = useMemo(
    () => curBlock?.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].gym || "",
    [curBlock],
  );
  const defaultNewExercise: Exercise = useMemo(
    () => ({
      name: "",
      apparatus: "",
      gym: curGym,
      weightType: "",
      sets: [],
      addedOn: true,
    }),
    [curGym],
  );
  const [newExercise, setNewExercise] = useState<Exercise>(defaultNewExercise);
  useEffect(
    () => setNewExercise(defaultNewExercise),
    [addExerciseIdx, defaultNewExercise],
  );

  const saveExercises = async (exercises: Exercise[]) => {
    if (!curUser?._id || !curBlock) return;
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
      weeks: curBlock.weeks.toSpliced(curBlock.curWeekIdx, 1, newDays),
    };

    await triggerUpdateUserBlock({ userId: curUser._id, block: newBlock });
  };

  const handleAddExercise = async () => {
    const updatedExercises = exercises.toSpliced(
      addExerciseIdx ?? exercises.length,
      0,
      newExercise,
    );
    try {
      await saveExercises(updatedExercises);
    } catch {
      showSnackbar("Failed to add exercise. Please try again.");
    } finally {
      onClose();
    }
  };

  if (addExerciseIdx === undefined) return null;

  return (
    <ConfirmationDialog
      open
      onClose={onClose}
      title="Add Exercise"
      onConfirm={handleAddExercise}
      confirming={addingExercise}
      confirmationDisabled={
        addingExercise ||
        newExercise.name === "" ||
        newExercise.apparatus === "" ||
        newExercise.weightType === ""
      }
    >
      <EditExercise newExercise={newExercise} setNewExercise={setNewExercise} />
    </ConfirmationDialog>
  );
};
