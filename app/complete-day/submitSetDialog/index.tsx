import { Block, Day, Exercise, Set } from "@/lib/types";
import { Dispatch, SetStateAction, useState } from "react";
import { FaSave } from "react-icons/fa";
import { EditSet } from "./EditSet";
import { DialogAction, ActionDialog } from "../../components/ActionDialog";
import { useBlock } from "@/app/providers/BlockProvider";
import { IoIosSkipForward } from "react-icons/io";
import { findLatestOccurrence } from "@/lib/blockUtils";
import { useTimer } from "@/app/providers/TimerProvider";

interface Props {
  setIdx: number;
  exercise: Exercise;
  exercisesState: Exercise[];
  setExercisesState: Dispatch<SetStateAction<Exercise[]>>;
  onClose: () => void;
}

export const SubmitSetDialog = ({
  setIdx,
  exercise,
  exercisesState,
  setExercisesState,
  onClose,
}: Props) => {
  const { curBlock, updateBlock } = useBlock();
  const { setTimerDialogOpen } = useTimer();

  const [exerciseState, setExerciseState] = useState<Exercise>(
    setIdx === exercise.sets.length
      ? {
          ...exercise,
          sets: [
            ...exercise.sets,
            { ...exercise.sets[setIdx - 1], completed: false, note: "" },
          ],
        }
      : exercise
  );

  console.log("exercise in dialog:", exerciseState);

  const saveExercises = (updatedExercises: Exercise[]) => {
    if (curBlock) {
      const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].toSpliced(
        curBlock.curDayIdx,
        1,
        {
          ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
          exercises: updatedExercises,
        }
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
                    e.gym === exercise.gym
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
            }
      );

      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock?.weeks.toSpliced(
          curBlock.curWeekIdx,
          1,
          updatedLaterDays
        ),
      };

      updateBlock(newBlock);
    }
  };

  const handleSubmitSet = (skip: boolean) => {
    const latestPreviousSet = findLatestOccurrence(
      curBlock,
      (e: Exercise) => {
        if (
          e.name === exercise.name &&
          e.apparatus === exercise.apparatus &&
          e.gym === exercise.gym &&
          e.sets[setIdx]
        )
          return e.sets[setIdx];
      },
      true
    );

    const updatedSets = skip
      ? latestPreviousSet ?? exerciseState.sets[setIdx]
      : exerciseState.sets[setIdx];

    const updatedExercise: Exercise = {
      ...exerciseState,
      sets: exerciseState.sets.toSpliced(setIdx, 1, {
        ...updatedSets,
        completed: !skip,
        skipped: skip,
        addedOn: setIdx === exercise.sets.length && !exercise.addedOn,
      }),
    };

    const updatedExercises = exercisesState.toSpliced(
      exercisesState.findIndex(
        (e) =>
          e.name === updatedExercise.name &&
          e.apparatus === updatedExercise.apparatus &&
          e.gym === updatedExercise.gym
      ),
      1,
      updatedExercise
    );

    setExercisesState(updatedExercises);
    saveExercises(updatedExercises);
    onClose();
    setTimerDialogOpen(true);
  };

  const editActions: DialogAction[] = [
    {
      icon: <FaSave fontSize={28} />,
      onClick: () => handleSubmitSet(false),
      variant: "primary",
    },
    {
      icon: <IoIosSkipForward fontSize={28} />,
      onClick: () => handleSubmitSet(true),
      disabled:
        exerciseState.sets[setIdx].skipped || setIdx === exercise.sets.length,
      variant: "primaryInverted",
    },
  ];

  return (
    <ActionDialog
      open={true}
      onClose={onClose}
      title="Submit Set"
      actions={editActions}
    >
      <EditSet
        setIdx={setIdx}
        exerciseState={exerciseState}
        setExerciseState={setExerciseState}
      />
    </ActionDialog>
  );
};
