import { Exercise, buildProgramWithSessionExercises } from "@liftledger/shared";
import { useEffect, useState } from "react";
import {
  findLatestOccurrence,
  useProgram,
  useCompletedExercises,
  useCurrentSession,
  useMe,
  useSetTimerEnd,
  useTimerSettings,
  useUpdateUserProgram,
} from "@liftledger/api-client";
import { ConfirmationDialog } from "../../../../components/ConfirmationDialog";
import { EditSet } from "./EditSet";
import { useSnackbar } from "../../../../providers/SnackbarProvider";

interface Props {
  exercise: Exercise | undefined;
  setIdx: number | undefined;
  onClose: () => void;
}

export const SubmitSetDialog = ({ exercise, setIdx, onClose }: Props) => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { trigger: triggerUpdateUserProgram } = useUpdateUserProgram();
  const { trigger: triggerSetTimerEnd } = useSetTimerEnd();
  const { resolveDuration } = useTimerSettings();
  const { showSnackbar } = useSnackbar();

  const { exercises } = useCurrentSession();
  const [submittingSet, setSubmittingSet] = useState(false);
  const [skippingSet, setSkippingSet] = useState(false);

  const [exerciseState, setExerciseState] = useState<Exercise>();
  const [displaySetIdx, setDisplaySetIdx] = useState(setIdx);
  useEffect(() => {
    if (setIdx === undefined) return;

    setExerciseState(
      exercise && setIdx === exercise.sets.length
        ? {
            ...exercise,
            sets: [
              ...exercise.sets,
              { ...exercise.sets[setIdx - 1], completed: false, note: "" },
            ],
          }
        : exercise,
    );

    setDisplaySetIdx(setIdx);
  }, [exercise, setIdx]);

  const saveExercises = async (updatedExercises: Exercise[]) => {
    if (!curUser?._id || !curProgram) return;

    await triggerUpdateUserProgram({
      userId: curUser._id,
      program: buildProgramWithSessionExercises(curProgram, updatedExercises),
    });
  };

  const handleSubmitSet = async (options?: { skip: boolean }) => {
    if (!exerciseState || setIdx === undefined) return;

    if (options?.skip) {
      setSkippingSet(true);
    } else {
      setSubmittingSet(true);
    }

    const latestPreviousSet = findLatestOccurrence(
      completedExercises,
      (e: Exercise) =>
        e.name === exercise?.name &&
        e.equipment === exercise?.equipment &&
        e.gym === exercise.gym &&
        !!e.sets[setIdx],
    )?.sets[setIdx];

    const updatedSet = options?.skip
      ? (latestPreviousSet ?? exerciseState.sets[setIdx])
      : exerciseState.sets[setIdx];

    const updatedExercise: Exercise = {
      ...exerciseState,
      sets: exerciseState.sets.toSpliced(setIdx, 1, {
        ...updatedSet,
        completed: !options?.skip,
        skipped: options?.skip,
        addedOn:
          exercise?.sets[setIdx]?.addedOn ??
          (setIdx === exercise?.sets.length && !exercise.addedOn),
      }),
    };

    const exerciseIdx = exercises.findIndex(
      (e: Exercise) =>
        e.name === updatedExercise.name &&
        e.equipment === updatedExercise.equipment &&
        e.gym === updatedExercise.gym,
    );

    if (exerciseIdx === -1) {
      showSnackbar("Error submitting set. Please try again.");
      setSkippingSet(false);
      setSubmittingSet(false);
      return;
    }

    const updatedExercises = exercises.toSpliced(
      exerciseIdx,
      1,
      updatedExercise,
    );

    try {
      await saveExercises(updatedExercises);
      onClose();
    } catch {
      showSnackbar("Error submitting set. Please try again.");
      setSkippingSet(false);
      setSubmittingSet(false);
      return;
    }

    if (!options?.skip && curUser?._id) {
      const duration = resolveDuration(updatedExercise.name);
      if (duration !== undefined) {
        try {
          await triggerSetTimerEnd({
            userId: curUser._id,
            timerEnd: new Date(Date.now() + duration * 1000),
          });
        } catch {
          showSnackbar("Failed to start rest timer.", "error");
        }
      }
    }

    setSkippingSet(false);
    setSubmittingSet(false);
  };

  return (
    <ConfirmationDialog
      open={!!exercise && setIdx !== undefined}
      onClose={onClose}
      title="Submit Set"
      onConfirm={handleSubmitSet}
      confirming={submittingSet || skippingSet}
      confirmationDisabled={submittingSet || skippingSet}
      secondaryAction="Skip Set"
      onSecondaryAction={() => handleSubmitSet({ skip: true })}
      secondaryActionLoading={skippingSet}
      secondaryActionDisabled={submittingSet || skippingSet}
    >
      <EditSet
        exerciseState={exerciseState}
        setExerciseState={setExerciseState}
        setIdx={displaySetIdx!}
      />
    </ConfirmationDialog>
  );
};
