import { Program, Day, Exercise } from "@liftledger/shared";
import { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "../../../providers/SnackbarProvider";
import {
  useProgram,
  useCurrentDay,
  useMe,
  useUpdateUserProgram,
} from "@liftledger/api-client";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { EditExercise } from "./EditExercise";

interface Props {
  addExerciseIdx: number | undefined;
  onClose: () => void;
}

export const AddExerciseDialog = ({ addExerciseIdx, onClose }: Props) => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { trigger: triggerUpdateUserProgram, isMutating: addingExercise } =
    useUpdateUserProgram();
  const { exercises } = useCurrentDay();
  const { showSnackbar } = useSnackbar();

  const curGym = useMemo(
    () => curProgram?.weeks[curProgram.curWeekIdx][curProgram.curDayIdx].gym || "",
    [curProgram],
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
    if (!curUser?._id || !curProgram) return;
    const newDays: Day[] = curProgram.weeks[curProgram.curWeekIdx].toSpliced(
      curProgram.curDayIdx,
      1,
      {
        ...curProgram.weeks[curProgram.curWeekIdx][curProgram.curDayIdx],
        exercises,
      },
    );

    const newProgram: Program = {
      ...curProgram,
      weeks: curProgram.weeks.toSpliced(curProgram.curWeekIdx, 1, newDays),
    };

    await triggerUpdateUserProgram({ userId: curUser._id, program: newProgram });
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
