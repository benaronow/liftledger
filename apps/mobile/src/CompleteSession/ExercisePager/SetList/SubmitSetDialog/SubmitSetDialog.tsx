import { Program, Session, Exercise, Set } from "@liftledger/shared";
import { useEffect, useState } from "react";
import {
  findLatestOccurrence,
  useProgram,
  useCompletedExercises,
  useCurrentSession,
  useMe,
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
  const { showSnackbar } = useSnackbar();

  const { exercises } = useCurrentSession();
  const [submittingSet, setSubmittingSet] = useState(false);
  const [skippingSet, setSkippingSet] = useState(false);

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

  const saveExercises = async (updatedExercises: Exercise[]) => {
    if (!curUser?._id || !curProgram) return;

    const newSessions: Session[] = curProgram.rotations[curProgram.curRotationIdx].toSpliced(
      curProgram.curSessionIdx,
      1,
      {
        ...curProgram.rotations[curProgram.curRotationIdx][curProgram.curSessionIdx],
        exercises: updatedExercises,
      },
    );

    const updatedLaterDays: Session[] = newSessions.map((session: Session, idx) =>
      idx <= curProgram.curSessionIdx
        ? session
        : {
            ...session,
            exercises: session.exercises.map((exercise: Exercise) => {
              const completedExercise = updatedExercises.find(
                (e: Exercise) =>
                  e.name === exercise.name &&
                  e.equipment === exercise.equipment &&
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
      rotations: curProgram.rotations.toSpliced(
        curProgram.curRotationIdx,
        1,
        updatedLaterDays,
      ),
    };

    await triggerUpdateUserProgram({
      userId: curUser._id,
      program: newProgram,
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

    // Guard against a -1 from findIndex: toSpliced(-1, …) would silently
    // replace the *last* exercise rather than the intended one.
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
    } finally {
      setSkippingSet(false);
      setSubmittingSet(false);
    }
  };

  return (
    <ConfirmationDialog
      open={!!exercise && setIdx !== undefined}
      onClose={onClose}
      title="Submit Set"
      icon="check-bold"
      onConfirm={handleSubmitSet}
      confirming={submittingSet || skippingSet}
      secondaryAction="Skip Set"
      onSecondaryAction={() => handleSubmitSet({ skip: true })}
      secondaryActionDisabled={
        exerciseState?.sets[setIdx!]?.skipped || setIdx === exercise!.sets.length
      }
    >
      <EditSet
        exerciseState={exerciseState}
        setExerciseState={setExerciseState}
        setIdx={setIdx!}
      />
    </ConfirmationDialog>
  );
};
