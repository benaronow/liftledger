import { Block, Day, Exercise, Set } from "@/lib/types";
import { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import { EditSet } from "./EditSet";
import { DialogAction, ActionDialog } from "@/app/components/ActionDialog";
import { useBlock } from "@/app/layoutProviders/BlockProvider";
import { IoIosSkipForward } from "react-icons/io";
import { useTimer } from "@/app/layoutProviders/TimerProvider";
import { useCompletedExercises } from "@/app/layoutProviders/CompletedExercisesProvider";
import { useCompleteDay } from "../CompleteDayProvider";
import { Spinner } from "react-bootstrap";

export const SubmitSetDialog = () => {
  const { curBlock, updateBlock } = useBlock();
  const { findLatestOccurrence } = useCompletedExercises();
  const { setTimerDialogOpen } = useTimer();
  const {
    exercises,
    exerciseToEdit: { exercise, setIdx } = { exercise: undefined, setIdx: 0 },
    setExerciseToEdit,
  } = useCompleteDay();
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
  }, [exercise]);

  const saveExercises = async (updatedExercises: Exercise[]) => {
    if (curBlock) {
      const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].toSpliced(
        curBlock.curDayIdx,
        1,
        {
          ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
          exercises: updatedExercises,
        },
      );

      const updatedLaterDays: Day[] = newDays.map((day: Day, idx) =>
        idx <= curBlock.curDayIdx
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

      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock?.weeks.toSpliced(
          curBlock.curWeekIdx,
          1,
          updatedLaterDays,
        ),
      };

      await updateBlock(newBlock);
    }
  };

  const handleSubmitSet = async (options?: { skip: boolean }) => {
    if (!exerciseState) return;

    if (options?.skip) {
      setSkippingSet(true);
    } else {
      setSubmittingSet(true);
    }

    const latestPreviousSet = findLatestOccurrence(
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

    const updatedExercises = exercises.toSpliced(
      exercises.findIndex(
        (e: Exercise) =>
          e.name === updatedExercise.name &&
          e.apparatus === updatedExercise.apparatus &&
          e.gym === updatedExercise.gym,
      ),
      1,
      updatedExercise,
    );

    await saveExercises(updatedExercises);

    setExerciseToEdit(undefined);
    setTimerDialogOpen(true);
    setSkippingSet(false);
    setSubmittingSet(false);
  };

  const editActions: DialogAction[] = [
    {
      icon: submittingSet ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <FaSave fontSize={28} />
      ),
      onClick: () => handleSubmitSet(),
      variant: "primary",
      disabled: submittingSet,
    },
    {
      icon: skippingSet ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <IoIosSkipForward fontSize={28} />
      ),
      onClick: () => handleSubmitSet({ skip: true }),
      disabled:
        skippingSet ||
        exerciseState?.sets[setIdx].skipped ||
        setIdx === exercise?.sets.length,
      variant: "primaryInverted",
    },
  ];

  return (
    <>
      {exercise && setIdx !== undefined && (
        <ActionDialog
          open={exercise && setIdx !== undefined}
          onClose={() => setExerciseToEdit(undefined)}
          title="Submit Set"
          actions={editActions}
        >
          <EditSet
            exerciseState={exerciseState}
            setExerciseState={setExerciseState}
          />
        </ActionDialog>
      )}
    </>
  );
};
