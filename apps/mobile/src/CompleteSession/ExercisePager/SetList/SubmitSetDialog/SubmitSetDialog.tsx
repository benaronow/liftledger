import {
  Exercise,
  Set,
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
import { SetKind } from "../SetList";
import { useSnackbar } from "../../../../providers/SnackbarProvider";

interface Props {
  exercise: Exercise | undefined;
  editingSet: { kind: SetKind; idx: number } | undefined;
  onClose: () => void;
}

export const SubmitSetDialog = ({ exercise, editingSet, onClose }: Props) => {
  const setIdx = editingSet?.idx;
  const kind = editingSet?.kind;
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
  const [displayKind, setDisplayKind] = useState<SetKind>(kind ?? "working");
  useEffect(() => {
    if (setIdx === undefined || !exercise) return;

    if (kind === "warmup") {
      const warmups = exercise.warmupSets ?? [];
      setExerciseState(
        setIdx === warmups.length
          ? {
              ...exercise,
              warmupSets: [
                ...warmups,
                warmups[setIdx - 1]
                  ? { ...warmups[setIdx - 1], completed: false, note: "" }
                  : { reps: null, weight: null, note: "", completed: false },
              ],
            }
          : exercise,
      );
    } else {
      setExerciseState(
        setIdx === exercise.workingSets.length
          ? {
              ...exercise,
              workingSets: [
                ...exercise.workingSets,
                { ...exercise.workingSets[setIdx - 1], completed: false, note: "" },
              ],
            }
          : exercise,
      );
    }

    setDisplaySetIdx(setIdx);
    setDisplayKind(kind ?? "working");
  }, [exercise, setIdx, kind]);

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

    const isWarmup = kind === "warmup";

    const latestPreviousSet = findLatestOccurrence(
      completedExercises,
      (e: Exercise) =>
        e.name === exercise?.name &&
        e.equipment === exercise?.equipment &&
        e.gym === exercise.gym &&
        (isWarmup ? !!e.warmupSets?.[setIdx] : !!e.workingSets[setIdx]),
    )?.[isWarmup ? "warmupSets" : "workingSets"]?.[setIdx];

    const stateArr = isWarmup
      ? (exerciseState.warmupSets ?? [])
      : exerciseState.workingSets;
    const originalArr = isWarmup
      ? (exercise?.warmupSets ?? [])
      : (exercise?.workingSets ?? []);

    const updatedSet = options?.skip
      ? (latestPreviousSet ?? stateArr[setIdx])
      : stateArr[setIdx];

    const submittedSet: Set = {
      ...updatedSet,
      completed: !options?.skip,
      skipped: options?.skip,
      addedOn:
        originalArr[setIdx]?.addedOn ??
        (setIdx === originalArr.length && !exercise?.addedOn),
      // Mirror the parent working set onto its dropsets on submit (never on skip).
      ...(!isWarmup && !options?.skip
        ? {
            dropSets: updatedSet.dropSets?.map((drop) => ({
              ...drop,
              completed: true,
            })),
          }
        : {}),
    };

    const updatedExercise: Exercise = isWarmup
      ? {
          ...exerciseState,
          warmupSets: stateArr.toSpliced(setIdx, 1, submittedSet),
        }
      : {
          ...exerciseState,
          workingSets: stateArr.toSpliced(setIdx, 1, submittedSet),
        };

    const exerciseIdx = exercises.findIndex(
      (e: Exercise) =>
        e.name === updatedExercise.name &&
        e.equipment === updatedExercise.equipment &&
        e.gym === updatedExercise.gym,
    );

    if (exerciseIdx === -1) {
      showSnackbar("Error submitting set. Please try again.", "error");
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
      showSnackbar("Error submitting set. Please try again.", "error");
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

  // A set is being added (vs edited) when its index sits at the end of the
  // original array — the append-seed effect grew the array by one for it.
  const isAdding =
    displaySetIdx ===
    (displayKind === "warmup"
      ? (exercise?.warmupSets?.length ?? 0)
      : (exercise?.workingSets.length ?? 0));
  const title = isAdding
    ? displayKind === "warmup"
      ? "Add Warmup Set"
      : "Add Working Set"
    : "Submit Set";

  return (
    <ConfirmationDialog
      open={!!exercise && setIdx !== undefined}
      onClose={onClose}
      title={title}
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
        kind={displayKind}
        setIdx={displaySetIdx!}
      />
    </ConfirmationDialog>
  );
};
