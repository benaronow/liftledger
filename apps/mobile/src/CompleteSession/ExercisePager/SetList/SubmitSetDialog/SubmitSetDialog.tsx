import {
  Exercise,
  buildProgramWithSessionExercises,
  findLatestOccurrence,
} from "@liftledger/shared";
import { useEffect, useState } from "react";
import {
  useProgram,
  useCompletedExercises,
  useCurrentSession,
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
  const { data: curProgram } = useProgram();
  const { data: completedExercises } = useCompletedExercises();
  const { send: triggerUpdateUserProgram } = useUpdateUserProgram();
  const { send: triggerSetTimerEnd } = useSetTimerEnd();
  const { data: timerSettingsData } = useTimerSettings();
  const { showSnackbar } = useSnackbar();

  const timerSettings = timerSettingsData?.timerSettings;

  const { exercises } = useCurrentSession();
  const [submittingSet, setSubmittingSet] = useState(false);
  const [skippingSet, setSkippingSet] = useState(false);

  const [exerciseState, setExerciseState] = useState<Exercise>();
  const [displaySetIdx, setDisplaySetIdx] = useState(setIdx);
  useEffect(() => {
    if (setIdx === undefined) return;

    setExerciseState(
      exercise && setIdx === exercise.workingSets.length
        ? {
            ...exercise,
            workingSets: [
              ...exercise.workingSets,
              { ...exercise.workingSets[setIdx - 1], completed: false, note: "" },
            ],
          }
        : exercise,
    );

    setDisplaySetIdx(setIdx);
  }, [exercise, setIdx]);

  const saveExercises = async (updatedExercises: Exercise[]) => {
    if (!curProgram) return;

    await triggerUpdateUserProgram({
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
        !!e.workingSets[setIdx],
    )?.workingSets[setIdx];

    const updatedSet = options?.skip
      ? (latestPreviousSet ?? exerciseState.workingSets[setIdx])
      : exerciseState.workingSets[setIdx];

    const updatedExercise: Exercise = {
      ...exerciseState,
      workingSets: exerciseState.workingSets.toSpliced(setIdx, 1, {
        ...updatedSet,
        completed: !options?.skip,
        skipped: options?.skip,
        addedOn:
          exercise?.workingSets[setIdx]?.addedOn ??
          (setIdx === exercise?.workingSets.length && !exercise.addedOn),
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

    if (!options?.skip) {
      const duration = (timerSettings?.defaultEnabled ?? true)
        ? (timerSettings?.exerciseOverrides?.[updatedExercise.name] ??
          timerSettings?.defaultTime ??
          120)
        : undefined;
      if (duration !== undefined) {
        try {
          await triggerSetTimerEnd(new Date(Date.now() + duration * 1000));
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
