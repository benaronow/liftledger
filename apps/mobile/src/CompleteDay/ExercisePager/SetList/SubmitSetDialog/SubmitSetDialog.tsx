import { Program, Day, Exercise, Set } from "@liftledger/shared";
import { useEffect, useState } from "react";
import {
  findLatestOccurrence,
  useProgram,
  useCompletedExercises,
  useCurrentDay,
  useMe,
  useUpdateUserProgram,
} from "@liftledger/api-client";
import { ConfirmationDialog } from "../../../../components/ConfirmationDialog";
import { TimerSettings } from "../../../TimerSettings";
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
  const { showSnackbar } = useSnackbar();

  const { exercises } = useCurrentDay();
  const [submittingSet, setSubmittingSet] = useState(false);
  const [skippingSet, setSkippingSet] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [exerciseState, setExerciseState] = useState<Exercise>();
  useEffect(() => {
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
  }, [exercise, setIdx]);

  const handleClose = () => {
    onClose();
    setSubmitted(false);
  };

  const saveExercises = async (updatedExercises: Exercise[]) => {
    if (!curUser?._id || !curProgram) return;

    const newDays: Day[] = curProgram.weeks[curProgram.curWeekIdx].toSpliced(
      curProgram.curDayIdx,
      1,
      {
        ...curProgram.weeks[curProgram.curWeekIdx][curProgram.curDayIdx],
        exercises: updatedExercises,
      },
    );

    const updatedLaterDays: Day[] = newDays.map((day: Day, idx) =>
      idx <= curProgram.curDayIdx
        ? day
        : {
            ...day,
            exercises: day.exercises.map((exercise: Exercise) => {
              const completedExercise = updatedExercises.find(
                (e: Exercise) =>
                  e.name === exercise.name &&
                  e.apparatus === exercise.apparatus &&
                  e.gym === exercise.gym,
              );

              return completedExercise
                ? {
                    ...completedExercise,
                    sets: completedExercise.sets
                      .filter((set) => !set.addedOn)
                      .map((set: Set) => ({
                        ...set,
                        completed: false,
                        skipped: undefined,
                        note: "",
                      })),
                  }
                : exercise;
            }),
          },
    );

    const newProgram: Program = {
      ...curProgram,
      weeks: curProgram.weeks.toSpliced(curProgram.curWeekIdx, 1, updatedLaterDays),
    };

    await triggerUpdateUserProgram({ userId: curUser._id, program: newProgram });
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
        e.apparatus === exercise?.apparatus &&
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
        e.apparatus === updatedExercise.apparatus &&
        e.gym === updatedExercise.gym,
    );

    // Guard against a -1 from findIndex: toSpliced(-1, …) would silently
    // replace the *last* exercise rather than the intended one.
    if (exerciseIdx === -1) {
      showSnackbar("Error submitting set. Please try again.");
      setSkippingSet(false);
      setSubmittingSet(false);
      return;
    }

    const updatedExercises = exercises.toSpliced(exerciseIdx, 1, updatedExercise);

    try {
      await saveExercises(updatedExercises);
      setSubmitted(true);
    } catch {
      showSnackbar("Error submitting set. Please try again.");
    } finally {
      setSkippingSet(false);
      setSubmittingSet(false);
    }
  };

  if (!exercise || setIdx === undefined) return null;

  return (
    <ConfirmationDialog
      open
      onClose={handleClose}
      title={submitted ? "Start Timer" : "Submit Set"}
      onConfirm={handleSubmitSet}
      confirming={submittingSet || skippingSet}
      secondaryAction="Skip Set"
      onSecondaryAction={() => handleSubmitSet({ skip: true })}
      secondaryActionDisabled={
        exerciseState?.sets[setIdx]?.skipped || setIdx === exercise.sets.length
      }
      hideActions={submitted}
    >
      {submitted ? (
        <TimerSettings onTimerStarted={handleClose} />
      ) : (
        <EditSet
          exerciseState={exerciseState}
          setExerciseState={setExerciseState}
          setIdx={setIdx}
        />
      )}
    </ConfirmationDialog>
  );
};
